import { IdentityAttributeJSON, MailJSON, RelationshipAttributeJSON, RenderHintsEditType, RenderHintsTechnicalType, RequestJSON, RequestMailJSON } from "@nmshd/content";
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
import { DraftAttributeDVO, RepositoryAttributeDVO } from "./content";
import { MailDVO, RequestMailDVO } from "./content/MailDVOs";
import { RequestDVO } from "./content/RequestDVOs";
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

            case "Attribute":
                if (content instanceof Array) {
                    return await this.expandAttributes(content);
                }

                return await this.expandAttribute(content);

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

                return await this.expandConsumptionAttribute(content as ConsumptionAttributeDTO);
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
                    requests: [], // await this.expandUnknownRequests(requestMailContent.requests),
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

    public expandRequest(request: RequestJSON): RequestDVO {
        const id = request.id ? request.id : "";
        return {
            id: id,
            name: `${request["@type"]} ${id}`,
            type: "RequestDVO",
            date: request.expiresAt,

            ...request
        };
    }

    public async expandConsumptionAttribute(attribute: ConsumptionAttributeDTO): Promise<RepositoryAttributeDVO> {
        const valueType = attribute.content.value["@type"];
        return {
            type: "RepositoryAttributeDVO",
            id: attribute.id,
            name: `i18n://attribute.title.${valueType}`,
            content: attribute.content,
            date: attribute.createdAt,
            owner: await this.expandAddress(attribute.content.owner),
            renderHints: {
                "@type": "RenderHints",
                technicalType: RenderHintsTechnicalType.Object,
                editType: RenderHintsEditType.InputLike
            },
            valueHints: {
                "@type": "ValueHints"
            },
            isValid: true,
            createdAt: attribute.createdAt,
            isOwn: true,
            sharedWith: []
        };
    }

    public async expandConsumptionAttributes(attributes: ConsumptionAttributeDTO[]): Promise<RepositoryAttributeDVO[]> {
        const attributesPromise = attributes.map((attribute) => this.expandConsumptionAttribute(attribute));
        return await Promise.all(attributesPromise);
    }

    public async expandAttribute(attribute: IdentityAttributeJSON | RelationshipAttributeJSON): Promise<DraftAttributeDVO> {
        return {
            type: "DraftAttributeDVO",
            content: attribute,
            name: "DraftAttribute",
            id: "",
            owner: await this.expandAddress(attribute.owner),
            renderHints: {
                "@type": "RenderHints",
                technicalType: RenderHintsTechnicalType.Object,
                editType: RenderHintsEditType.InputLike
            },
            valueHints: {
                "@type": "ValueHints"
            }
        };
    }

    public async expandAttributes(attributes: (IdentityAttributeJSON | RelationshipAttributeJSON)[]): Promise<DraftAttributeDVO[]> {
        const attributesPromise = attributes.map((attribute) => this.expandAttribute(attribute));
        return await Promise.all(attributesPromise);
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
        // TODO: re-enable when we can query relationship info
        // if (!relationshipInfo) {
        //     const relationshipInfoResult = await this.consumption.relationshipInfo.getRelationshipInfoByRelationship({ relationshipId: relationship.id });
        //     relationshipInfo = relationshipInfoResult.value;
        // }

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
            name: relationshipInfo?.userTitle ?? relationshipInfo?.title ?? "",
            description: relationshipInfo?.userDescription ?? relationshipInfo?.description ?? "",
            date: relationship.changes[0].request.createdAt,
            image: "",
            type: "RelationshipDVO",
            status: relationship.status,
            statusText: statusText,
            direction: direction,
            isPinned: relationshipInfo?.isPinned ?? false,
            theme: {
                image: relationshipInfo?.theme?.image,
                headerImage: relationshipInfo?.theme?.imageBar,
                backgroundColor: relationshipInfo?.theme?.backgroundColor,
                foregroundColor: relationshipInfo?.theme?.foregroundColor
            },
            changes: changes,
            changeCount: changes.length
        };
    }

    public async expandRelationshipDTO(relationship: RelationshipDTO): Promise<IdentityDVO> {
        // TODO: re-enable when we can query relationship info
        // const relationshipInfoResult = await this.consumption.relationshipInfo.getRelationshipInfoByRelationship({ relationshipId: relationship.id });
        // const relationshipInfo = relationshipInfoResult.value;

        // const name = relationshipInfo.userTitle ? relationshipInfo.userTitle : relationshipInfo.title;
        // let description = relationshipInfo.userDescription ? relationshipInfo.userDescription : relationshipInfo.description;
        const name = "";
        const description = "";

        const initials = (name.match(/\b\w/g) ?? []).join("");

        const relationshipDVO = await this.createRelationshipDVO(relationship);
        // TODO: re-enable when we can query relationship info
        // if (!description) {
        //     description = relationshipDVO.statusText;
        // }

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
