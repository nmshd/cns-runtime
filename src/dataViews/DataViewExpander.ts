import { AttributeJSON, AttributesChangeRequestJSON, AttributesRequestJSON, AttributesShareRequestJSON, MailJSON, RequestJSON, RequestMailJSON } from "@nmshd/content";
import { CoreAddress, IdentityController, Realm, Relationship, RelationshipStatus } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { FileDVO, IdentityDVO } from "..";
import { TransportServices } from "../extensibility";
import { ConsumptionServices } from "../extensibility/ConsumptionServices";
import {
    ConsumptionAttributeDTO,
    FileDTO,
    IdentityDTO,
    MessageDTO,
    MessageWithAttachmentsDTO,
    RecipientDTO,
    RelationshipChangeDTO,
    RelationshipDTO,
    RelationshipInfoDTO
} from "../types";
import { RuntimeErrors } from "../useCases";
import { Error } from "./common/Error";
import { Warning } from "./common/Warning";
import { MatchedAttributesDVO } from "./consumption/MatchedAttributesDVO";
import { StoredAttributeDVO } from "./consumption/StoredAttributeDVO";
import { AttributeDVO } from "./content/AttributeDVO";
import { MailDVO, RequestMailDVO } from "./content/MailDVOs";
import { AttributeChange, AttributesChangeRequestDVO, AttributesRequestDVO, AttributesShareRequestDVO, RequestDVO } from "./content/RequestDVOs";
import { DataViewObject } from "./DataViewObject";
import { DataViewTranslateable } from "./DataViewTranslateable";
import { MessageDVO, MessageStatus, RecipientDVO } from "./transport/MessageDVO";
import { RelationshipChangeDVO, RelationshipChangeResponseDVO, RelationshipDirection, RelationshipDVO } from "./transport/RelationshipDVO";

export class DataViewExpander {
    public constructor(
        @Inject private readonly transport: TransportServices,
        @Inject private readonly consumption: ConsumptionServices,
        @Inject private readonly identityController: IdentityController
    ) {}

    public async expand(content: any, expectedType?: string): Promise<DataViewObject | DataViewObject[]> {
        let type = expectedType;
        if (content["@type"]) {
            type = content["@type"];
        }

        if (content instanceof Array) {
            if (content.length > 0) {
                type = content[0]["@type"];
            } else return [];
        }

        if (!type) {
            throw RuntimeErrors.general.invalidPayload("No type found.");
        }
        switch (type) {
            case "Message":
                if (content instanceof Array) {
                    return await this.expandMessageDTOs(content as MessageDTO[]);
                }

                return await this.expandMessageDTO(content as MessageDTO);

            case "Request":
                if (content instanceof Array) {
                    return await this.expandUnknownRequests(content as RequestJSON[]);
                }

                return await this.expandUnknownRequest(content as RequestJSON);

            case "AttributesShareRequest":
                if (content instanceof Array) {
                    return await this.expandAttributesShareRequests(content as AttributesShareRequestJSON[]);
                }

                return await this.expandAttributesShareRequest(content as AttributesShareRequestJSON);

            case "AttributesChangeRequest":
                if (content instanceof Array) {
                    return await this.expandAttributesChangeRequests(content as AttributesChangeRequestJSON[]);
                }

                return await this.expandAttributesChangeRequest(content as AttributesChangeRequestJSON);

            case "Attribute":
                if (content instanceof Array) {
                    return await this.expandAttributes(content as AttributeJSON[]);
                }

                return this.expandAttribute(content as AttributeJSON);

            case "AttributeName":
                if (content instanceof Array) {
                    return await this.expandAttributeNames(content as string[]);
                }

                return await this.expandAttributeName(content as string);

            case "Address":
                if (content instanceof Array) {
                    return await this.expandAddresses(content as string[]);
                }

                return await this.expandAddress(content as string);

            case "FileId":
                if (content instanceof Array) {
                    return await this.expandFileIds(content as string[]);
                }

                return await this.expandFileId(content as string);

            case "File":
                if (content instanceof Array) {
                    return await this.expandFileDTOs(content as FileDTO[]);
                }

                return await this.expandFileDTO(content as FileDTO);

            case "Recipient":
                if (content instanceof Array) {
                    return await this.expandRecipients(content as RecipientDTO[]);
                }

                return await this.expandAddress(content as string);

            case "Relationship":
                if (content instanceof Array) {
                    return await this.expandRelationshipDTOs(content as RelationshipDTO[]);
                }

                return await this.expandRelationshipDTO(content as RelationshipDTO);

            case "ConsumptionAttribute":
                if (content instanceof Array) {
                    return await this.expandConsumptionAttributes(content as ConsumptionAttributeDTO[]);
                }

                return this.expandConsumptionAttribute(content as ConsumptionAttributeDTO);
            default:
                throw RuntimeErrors.general.notImplemented();
        }
    }

    public async expandMessageDTO(message: MessageDTO | MessageWithAttachmentsDTO): Promise<MessageDVO | MailDVO | RequestMailDVO> {
        const recipientRelationships = await this.expandRecipients(message.recipients);
        const addressMap: Record<string, RecipientDVO> = {};
        recipientRelationships.forEach((value) => (addressMap[value.id] = value));
        const createdByRelationship = await this.expandAddress(message.createdBy);
        const fileIds = [];
        const filePromises = [];
        for (const attachment of message.attachments) {
            if (typeof attachment === "string") {
                filePromises.push(this.expandFileId(attachment));
                fileIds.push(attachment);
            } else {
                filePromises.push(this.expandFileDTO(attachment));
                fileIds.push(attachment.id);
            }
        }
        const files = await Promise.all(filePromises);

        const isOwn = this.identityController.isMe(CoreAddress.from(message.createdBy));

        let peer: IdentityDVO;
        let status = MessageStatus.Received;
        if (isOwn) {
            const receivedByEveryone = message.recipients.every((r) => !!r.receivedAt);
            status = receivedByEveryone ? MessageStatus.Delivered : MessageStatus.Delivering;
            // Overwrite the RecipientDVO to be a IdentityDVO for this special case
            peer = { ...recipientRelationships[0], type: "IdentityDVO" };
        } else {
            peer = createdByRelationship;
        }

        const name = DataViewTranslateable.transport.messageName;
        const messageDVO: MessageDVO = {
            id: message.id,
            name: name,
            date: message.createdAt,
            type: "MessageDVO",
            createdByDevice: message.createdByDevice,
            createdAt: message.createdAt,
            createdBy: createdByRelationship,
            recipients: recipientRelationships,
            attachments: files,
            isOwn,
            recipientCount: message.recipients.length,
            attachmentCount: message.attachments.length,
            status,
            statusText: `i18n://dvo.message.${status}`,
            image: "",
            peer: peer
        };

        if (message.content["@type"] === "Mail" || message.content["@type"] === "RequestMail") {
            const mailContent = message.content as MailJSON;

            const to: RecipientDVO[] = mailContent.to.map((value) => addressMap[value]);

            let cc: RecipientDVO[] = [];
            if (mailContent.cc) {
                cc = mailContent.cc.map((value) => addressMap[value]);
            }

            const mailDVO: MailDVO = {
                ...messageDVO,
                type: "MailDVO",
                name: mailContent.subject ? mailContent.subject : DataViewTranslateable.consumption.mails.mailSubjectFallback,
                subject: mailContent.subject,
                body: mailContent.body,
                to: to,
                toCount: mailContent.to.length,
                cc: cc,
                ccCount: cc.length
            };

            if (mailContent["@type"] === "RequestMail") {
                const requestMailContent = message.content as RequestMailJSON;

                const requestMailDVO: RequestMailDVO = {
                    ...mailDVO,
                    type: "RequestMailDVO",
                    name: requestMailContent.subject ? requestMailContent.subject : DataViewTranslateable.consumption.mails.requestMailSubjectFallback,
                    requests: await this.expandUnknownRequests(requestMailContent.requests),
                    requestCount: requestMailContent.requests.length
                };

                return requestMailDVO;
            }

            return mailDVO;
        }

        return messageDVO;
    }

    public async expandMessageDTOs(messages: MessageDTO[]): Promise<(MessageDVO | MailDVO | RequestMailDVO)[]> {
        const messagePromises = messages.map((message) => this.expandMessageDTO(message));
        return await Promise.all(messagePromises);
    }

    public async expandUnknownRequest(request: RequestJSON | AttributesChangeRequestJSON | AttributesShareRequestJSON | AttributesRequestJSON): Promise<RequestDVO> {
        switch (request["@type"]) {
            case "AttributesRequest":
                return await this.expandAttributesRequest(request as AttributesRequestJSON);
            case "AttributesShareRequest":
                return await this.expandAttributesShareRequest(request as AttributesShareRequestJSON);
            case "AttributesChangeRequest":
                return await this.expandAttributesChangeRequest(request as AttributesChangeRequestJSON);
        }
        return {
            id: request.id ? request.id : "",
            name: `${request["@type"]} ${request.id ? request.id : ""}`,
            description: "i18n://dvo.request.unknownType",
            type: "RequestDVO",
            date: request.expiresAt

            // TODO: correctly expand the request
            // ...request
        };
    }

    public expandRequest(request: AttributesChangeRequestJSON | AttributesShareRequestJSON | AttributesRequestJSON): RequestDVO {
        return {
            id: request.id ? request.id : "",
            name: `${request["@type"]} ${request.key}`,
            type: "RequestDVO",
            date: request.expiresAt,

            ...request
        };
    }

    public async expandUnknownRequests(requests: (RequestJSON | AttributesChangeRequestJSON | AttributesShareRequestJSON)[]): Promise<RequestDVO[]> {
        const requestsPromise = requests.map((request) => this.expandUnknownRequest(request));
        return await Promise.all(requestsPromise);
    }

    public async expandAttributesShareRequest(attributesShareRequest: AttributesShareRequestJSON): Promise<AttributesShareRequestDVO> {
        const request = this.expandRequest(attributesShareRequest);

        const recipientObjects = [];
        let possibleRecipientCount = 0;
        for (const recipient of attributesShareRequest.recipients) {
            if (this.identityController.isMe(CoreAddress.from(recipient))) {
                continue;
            }

            const identity = await this.expandIdentityForAddress(recipient);
            if (identity.hasRelationship) {
                recipientObjects.push(identity);
                possibleRecipientCount++;
            }
        }

        if (recipientObjects.length === 0) {
            request.errorCount = (request.errorCount ?? 0) + 1;
            const error: Error = {
                code: "error.dvo.request.AttributeShareRequest.noRelationship",
                message: "There are no relationships to any of the recipients of this request."
            };

            if (!request.errors) {
                request.errors = [];
            }
            request.errors.push(error);
        } else if (recipientObjects.length !== possibleRecipientCount) {
            request.warningCount = (request.warningCount ?? 0) + 1;
            const warning: Warning = {
                code: "warning.dvo.request.AttributeShareRequest.onlyRelationships",
                message: "Not to every recipient of this request exist a relationship."
            };

            if (!request.warnings) {
                request.warnings = [];
            }
            request.warnings.push(warning);
        }

        const attributesObjects: MatchedAttributesDVO[] = [];
        for (const attributeName of attributesShareRequest.attributes) {
            const attributeDVO = await this.expandAttributeName(attributeName);
            attributesObjects.push(attributeDVO);
        }

        let name: string;

        if (attributesObjects.length > 1) {
            name = DataViewTranslateable.consumption.requests.attributesShareRequestNamePlural;
        } else {
            name = DataViewTranslateable.consumption.requests.attributesShareRequestName;
        }

        return {
            ...request,
            name,
            type: "AttributesShareRequestDVO",
            attributes: attributesObjects,
            attributeCount: attributesObjects.length,
            recipients: recipientObjects,
            recipientCount: recipientObjects.length,
            possibleRecipientCount
        };
    }

    public expandConsumptionAttribute(attribute: ConsumptionAttributeDTO): StoredAttributeDVO {
        return {
            type: "StoredAttributeDVO",
            id: attribute.id,
            name: attribute.content.name,
            value: attribute.content.value,
            date: attribute.createdAt,
            isOwn: true,
            sharedItems: [],
            sharedItemCount: 0
        };
    }

    public async expandConsumptionAttributes(attributes: ConsumptionAttributeDTO[]): Promise<StoredAttributeDVO[]> {
        const attributesPromise = attributes.map((attribute) => this.expandConsumptionAttribute(attribute));
        return await Promise.all(attributesPromise);
    }

    public async expandAttributeName(name: string): Promise<MatchedAttributesDVO> {
        const consumptionAttribute = await this.consumption.attributes.getAttributeByName({ name: name });
        let matchedAttributes: StoredAttributeDVO[] = [];
        if (consumptionAttribute.isSuccess) {
            matchedAttributes = [this.expandConsumptionAttribute(consumptionAttribute.value)];
        }
        let bestMatch: StoredAttributeDVO | undefined;
        if (matchedAttributes.length > 0) {
            bestMatch = matchedAttributes[0];
        }

        return {
            type: "MatchedAttributesDVO",
            id: name,
            name: name,
            matches: matchedAttributes,
            matchCount: matchedAttributes.length,
            bestMatch: bestMatch
        };
    }

    public async expandAttributeNames(names: string[]): Promise<MatchedAttributesDVO[]> {
        const namesPromise = names.map((name) => this.expandAttributeName(name));
        return await Promise.all(namesPromise);
    }

    public expandAttribute(attribute: AttributeJSON): AttributeDVO {
        return {
            type: "AttributeDVO",
            id: attribute.name,
            name: attribute.name,
            value: attribute.value,
            isOwn: false
        };
    }

    public async expandAttributes(attributes: AttributeJSON[]): Promise<AttributeDVO[]> {
        const attributesPromise = attributes.map((attribute) => this.expandAttribute(attribute));
        return await Promise.all(attributesPromise);
    }

    public async expandAttributesChangeRequest(attributesChangeRequest: AttributesChangeRequestJSON): Promise<AttributesChangeRequestDVO> {
        const request = this.expandRequest(attributesChangeRequest);

        let applyToObject;
        if (attributesChangeRequest.applyTo) {
            applyToObject = await this.expandIdentityForAddress(attributesChangeRequest.applyTo);
        } else {
            applyToObject = this.expandSelf();
        }

        let name: string;

        const attributesObjects: AttributeDVO[] = [];
        for (const attribute of attributesChangeRequest.attributes) {
            const attributeDVO = this.expandAttribute(attribute);
            attributesObjects.push(attributeDVO);
        }
        const oldAttributesObjects = await this.expandAttributeNames(attributesObjects.map((item) => item.id));

        if (attributesObjects.length > 1) {
            name = DataViewTranslateable.consumption.requests.attributesChangeRequestNamePlural;
        } else {
            name = DataViewTranslateable.consumption.requests.attributesChangeRequestName;
        }

        const changes: AttributeChange[] = [];
        attributesObjects.forEach((attribute, index) => {
            changes.push({
                oldAttribute: oldAttributesObjects[index],
                newAttribute: attribute
            });
        });

        return {
            ...request,
            type: "AttributesChangeRequestDVO",
            name: name,
            newAttributes: attributesObjects,
            newAttributeCount: attributesObjects.length,
            oldAttributes: oldAttributesObjects,
            oldAttributeCount: oldAttributesObjects.length,
            applyTo: applyToObject,
            changes: changes,
            changeCount: changes.length
        };
    }

    public async expandAttributesRequest(attributesRequest: AttributesRequestJSON): Promise<AttributesRequestDVO> {
        const request = this.expandRequest(attributesRequest);

        let name: string;

        const attributesObjects = await this.expandAttributeNames(attributesRequest.names);

        if (attributesObjects.length > 1) {
            name = DataViewTranslateable.consumption.requests.attributesChangeRequestNamePlural;
        } else {
            name = DataViewTranslateable.consumption.requests.attributesChangeRequestName;
        }

        return {
            ...request,
            type: "AttributesRequestDVO",
            names: attributesRequest.names,
            nameCount: attributesRequest.names.length,
            name: name,
            attributes: attributesObjects,
            attributeCount: attributesObjects.length,
            required: attributesRequest.required
        };
    }

    public expandSelf(): IdentityDVO {
        const name = "i18n://dvo.identity.self.name";
        const initials = "i18n://dvo.identity.self.initials";

        return {
            id: this.identityController.address.toString(),
            type: "IdentityDVO",
            name: name,
            initials: initials,
            realm: Realm.Prod,
            description: "i18n://dvo.identity.self.description",
            isSelf: true,
            hasRelationship: false
        };
    }

    public expandUnknown(address: string): IdentityDVO {
        const name = address.substring(3, 9);
        const initials = (name.match(/\b\w/g) ?? []).join("");

        return {
            id: this.identityController.address.toString(),
            type: "IdentityDVO",
            name: name,
            initials: initials,
            realm: Realm.Prod,
            description: "i18n://dvo.identity.unknown.description",
            isSelf: false,
            hasRelationship: false
        };
    }

    public async expandAttributesShareRequests(requests: AttributesShareRequestJSON[]): Promise<AttributesShareRequestDVO[]> {
        const requestsPromise = requests.map((request) => this.expandAttributesShareRequest(request));
        return await Promise.all(requestsPromise);
    }

    public async expandAttributesChangeRequests(requests: AttributesChangeRequestJSON[]): Promise<AttributesChangeRequestDVO[]> {
        const requestsPromise = requests.map((request) => this.expandAttributesChangeRequest(request));
        return await Promise.all(requestsPromise);
    }

    public async expandAddress(address: string): Promise<IdentityDVO> {
        if (this.identityController.isMe(CoreAddress.from(address))) {
            return this.expandSelf();
        }

        const result = await this.transport.relationships.getRelationshipByAddress({ address: address });
        if (result.isError) {
            return this.expandUnknown(address);
        }

        return await this.expandRelationshipDTO(result.value);
    }

    public async expandAddresses(addresses: string[]): Promise<IdentityDVO[]> {
        const relationshipPromises = addresses.map((address) => this.expandAddress(address));
        return await Promise.all(relationshipPromises);
    }

    public async expandRecipient(recipient: RecipientDTO): Promise<RecipientDVO> {
        const identity = await this.expandAddress(recipient.address);
        return {
            ...identity,
            type: "RecipientDVO",
            receivedAt: recipient.receivedAt,
            receivedByDevice: recipient.receivedByDevice
        };
    }

    public async expandRecipients(recipients: RecipientDTO[]): Promise<RecipientDVO[]> {
        const relationshipPromises = recipients.map((recipient) => this.expandRecipient(recipient));
        return await Promise.all(relationshipPromises);
    }

    public expandRelationshipChange(relationship: RelationshipDTO, change: RelationshipChangeDTO): Promise<RelationshipChangeDVO> {
        const date = change.response ? change.response.createdAt : change.request.createdAt;
        let isOwn = false;
        if (this.identityController.isMe(CoreAddress.from(change.request.createdBy))) {
            isOwn = true;
        }

        let response: RelationshipChangeResponseDVO | undefined;
        if (change.response) {
            response = {
                ...change.response,
                id: `${change.id}_response`,
                name: "i18n://dvo.relationshipChange.response.name",
                type: "RelationshipChangeResponseDVO"
            };
        }

        return Promise.resolve({
            type: "RelationshipChangeDVO",
            id: change.id,
            name: "",
            date: date,
            status: change.status,
            statusText: `i18n://dvo.relationshipChange.${change.status}`,
            changeType: change.type,
            changeTypeText: `i18n://dvo.relationshipChange.${change.type}`,
            isOwn: isOwn,
            request: {
                ...change.request,
                id: `${change.id}_request`,
                name: "i18n://dvo.relationshipChange.request.name",
                type: "RelationshipChangeRequestDVO"
            },
            response: response
        });
    }

    public async expandRelationshipChanges(relationship: RelationshipDTO): Promise<RelationshipChangeDVO[]> {
        const changePromises = relationship.changes.map((change) => this.expandRelationshipChange(relationship, change));
        return await Promise.all(changePromises);
    }

    protected async createRelationshipDVO(relationship: RelationshipDTO, relationshipInfo?: RelationshipInfoDTO): Promise<RelationshipDVO> {
        if (!relationshipInfo) {
            const relationshipInfoResult = await this.consumption.relationshipInfo.getRelationshipInfoByRelationship({ relationshipId: relationship.id });
            relationshipInfo = relationshipInfoResult.value;
        }

        let direction = RelationshipDirection.Incoming;
        if (this.identityController.isMe(CoreAddress.from(relationship.changes[0].request.createdBy))) {
            direction = RelationshipDirection.Outgoing;
        }

        let statusText = "";
        if (relationship.status === RelationshipStatus.Pending && direction === RelationshipDirection.Outgoing) {
            statusText = DataViewTranslateable.transport.relationshipOutgoing;
        } else if (relationship.status === RelationshipStatus.Pending) {
            statusText = DataViewTranslateable.transport.relationshipIncoming;
        } else if (relationship.status === RelationshipStatus.Rejected) {
            statusText = DataViewTranslateable.transport.relationshipRejected;
        } else if (relationship.status === RelationshipStatus.Revoked) {
            statusText = DataViewTranslateable.transport.relationshipRevoked;
        } else if (relationship.status === RelationshipStatus.Active) {
            statusText = DataViewTranslateable.transport.relationshipActive;
        }

        const changes = await this.expandRelationshipChanges(relationship);

        return {
            id: relationship.id,
            name: relationshipInfo.userTitle ? relationshipInfo.userTitle : relationshipInfo.title,
            description: relationshipInfo.userDescription ? relationshipInfo.userDescription : relationshipInfo.description,
            date: relationship.changes[0].request.createdAt,
            image: "",
            type: "RelationshipDVO",
            status: relationship.status,
            statusText: statusText,
            direction: direction,
            isPinned: relationshipInfo.isPinned,
            theme: {
                image: relationshipInfo.theme?.image,
                headerImage: relationshipInfo.theme?.imageBar,
                backgroundColor: relationshipInfo.theme?.backgroundColor,
                foregroundColor: relationshipInfo.theme?.foregroundColor
            },
            changes: changes,
            changeCount: changes.length
        };
    }

    public async expandRelationshipDTO(relationship: RelationshipDTO): Promise<IdentityDVO> {
        const relationshipInfoResult = await this.consumption.relationshipInfo.getRelationshipInfoByRelationship({ relationshipId: relationship.id });
        const relationshipInfo = relationshipInfoResult.value;

        const name = relationshipInfo.userTitle ? relationshipInfo.userTitle : relationshipInfo.title;
        let description = relationshipInfo.userDescription ? relationshipInfo.userDescription : relationshipInfo.description;

        const initials = (name.match(/\b\w/g) ?? []).join("");

        const relationshipDVO = await this.createRelationshipDVO(relationship, relationshipInfo);
        if (!description) {
            description = relationshipDVO.statusText;
        }

        return {
            type: "IdentityDVO",
            id: relationship.peer,
            name: name,
            date: relationshipDVO.date,
            description: description,
            publicKey: relationship.peerIdentity.publicKey,
            realm: relationship.peerIdentity.realm,
            initials,
            isSelf: false,
            hasRelationship: true,
            relationship: relationshipDVO
        };
    }

    public async expandIdentityForAddress(address: string): Promise<IdentityDVO> {
        if (address === this.identityController.address.toString()) {
            return this.expandSelf();
        }

        const relationshipResult = await this.transport.relationships.getRelationshipByAddress({
            address: address
        });
        if (relationshipResult.isSuccess) {
            return await this.expandRelationshipDTO(relationshipResult.value);
        }

        if (relationshipResult.error.code !== RuntimeErrors.general.recordNotFound(Relationship).code) {
            throw relationshipResult.error;
        }

        const name = address.substring(3, 9);
        const initials = (name.match(/\b\w/g) ?? []).join("");

        return {
            id: address,
            type: "IdentityDVO",
            name: name,
            initials: initials,
            publicKey: "i18n://dvo.identity.publicKey.unknown",
            realm: this.identityController.realm.toString(),
            description: "i18n://dvo.identity.unknown",
            isSelf: false,
            hasRelationship: false
        };
    }

    public async expandIdentity(identity: IdentityDTO): Promise<IdentityDVO> {
        return await this.expandIdentityForAddress(identity.address);
    }

    public async expandRelationshipDTOs(relationships: RelationshipDTO[]): Promise<IdentityDVO[]> {
        const relationshipPromises = relationships.map((relationship) => this.expandRelationshipDTO(relationship));
        return await Promise.all(relationshipPromises);
    }

    public async expandFileId(id: string): Promise<FileDVO> {
        const result = await this.transport.files.getFile({ id: id });
        if (result.isError) {
            throw result.error;
        }

        return await this.expandFileDTO(result.value);
    }

    public async expandFileIds(ids: string[]): Promise<FileDVO[]> {
        const filePromises = ids.map((id) => this.expandFileId(id));
        return await Promise.all(filePromises);
    }

    public async expandFileDTO(file: FileDTO): Promise<FileDVO> {
        return {
            ...file,
            type: "FileDVO",
            id: file.id,
            name: file.title ? file.title : file.filename,
            date: file.createdAt,
            image: "",
            filename: file.filename,
            filesize: file.filesize,
            createdBy: await this.expandAddress(file.createdBy),
            deletedBy: file.deletedBy ? await this.expandAddress(file.deletedBy) : undefined
        };
    }

    public async expandFileDTOs(files: FileDTO[]): Promise<FileDVO[]> {
        const filePromises = files.map((file) => this.expandFileDTO(file));
        return await Promise.all(filePromises);
    }
}
