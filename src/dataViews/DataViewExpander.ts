import { SingleRelationshipController } from "@nmshd/consumption";
import { AttributeJSON, AttributesChangeRequestJSON, AttributesShareRequestJSON, Mail, RequestJSON, RequestMail } from "@nmshd/content";
import { CoreAddress, CoreId, IdentityController, RelationshipStatus } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { TransportServices } from "../extensibility";
import { ConsumptionServices } from "../extensibility/ConsumptionServices";
import { ConsumptionAttributeDTO, FileDTO, MessageDTO, MessageWithAttachmentsDTO, RecipientDTO, RelationshipDTO } from "../types";
import { RuntimeErrors } from "../useCases";
import { Error } from "./common/Error";
import { Warning } from "./common/Warning";
import { AttributeDVO } from "./consumption/AttributeDVO";
import { AttributesChangeRequestDVO } from "./consumption/AttributesChangeRequestDVO";
import { AttributesShareRequestDVO } from "./consumption/AttributesShareRequestDVO";
import { RequestDVO } from "./consumption/RequestDVO";
import { DataViewObject } from "./DataViewObject";
import { DataViewTranslateable } from "./DataViewTranslateable";
import { FileDVO } from "./transport/FileDVO";
import { IdentityDVO, OrganizationProperties, PersonProperties } from "./transport/IdentityDVO";
import { MessageDVO, MessageStatus } from "./transport/MessageDVO";

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
                    return await this.expandRequests(content as RequestJSON[]);
                }

                return this.expandRequest(content as RequestJSON);

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

    public async expandMessageDTO(message: MessageDTO | MessageWithAttachmentsDTO): Promise<MessageDVO> {
        const recipientRelationships = await this.expandRecipients(message.recipients);
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

        let peerRelationships = [createdByRelationship];
        if (isOwn) {
            peerRelationships = recipientRelationships;
        }

        const status = MessageStatus.Delivering; // TODO: JSSNMSHDD-2462 (Map message status once receivedAt is updated)

        let type = "MessageDVO";
        let name = DataViewTranslateable.transport.messageName;

        if (message.content instanceof RequestMail) {
            name = DataViewTranslateable.consumption.mails.requestMailSubjectFallback;
            type = "RequestMailDVO";
            if (message.content.subject) {
                name = message.content.subject;
            }
        } else if (message.content instanceof Mail) {
            name = DataViewTranslateable.consumption.mails.mailSubjectFallback;
            type = "MailDVO";
            if (message.content.subject) {
                name = message.content.subject;
            }
        }

        return {
            id: message.id,
            name: name,
            date: message.createdAt,
            type: type,
            message: {
                ...message,
                attachments: fileIds,
                isOwn: isOwn,
                attachmentCount: message.attachments.length,
                attachmentObjects: files,
                createdByObject: createdByRelationship,
                peerObjects: peerRelationships,
                recipientCount: message.recipients.length,
                recipientObjects: recipientRelationships,
                status: status
            },
            image: ""
        };
    }

    public async expandMessageDTOs(messages: MessageDTO[]): Promise<MessageDVO[]> {
        const messagePromises = messages.map((message) => this.expandMessageDTO(message));
        return await Promise.all(messagePromises);
    }

    public expandRequest(request: RequestJSON): RequestDVO {
        return {
            id: "requestid",
            name: "Request",
            type: request["@type"],
            request: {
                ...request
            }
        };
    }

    public async expandRequests(requests: RequestJSON[]): Promise<RequestDVO[]> {
        const requestsPromise = requests.map((request) => this.expandRequest(request));
        return await Promise.all(requestsPromise);
    }

    public async expandAttributesShareRequest(attributesShareRequest: AttributesShareRequestJSON): Promise<AttributesShareRequestDVO> {
        const request = this.expandRequest(attributesShareRequest);

        const recipientObjects = [];
        let relationshipCount = 0;
        for (const recipient of attributesShareRequest.recipients) {
            if (this.identityController.isMe(CoreAddress.from(recipient))) {
                continue;
            }

            const result = await this.transport.relationships.getRelationshipByAddress({
                address: recipient.toString()
            });
            if (result.isSuccess) {
                recipientObjects.push(await this.expandRelationshipDTO(result.value));
                relationshipCount++;
            }
        }

        if (recipientObjects.length === 0) {
            request.errorCount = (request.errorCount ?? 0) + 1;
            const error: Error = {
                code: "error.consumption.request.AttributeShareRequest.noRelationship",
                message: "There are no relationships to any of the recipients of this request."
            };

            if (!request.errors) {
                request.errors = [];
            }
            request.errors.push(error);
        } else if (recipientObjects.length !== relationshipCount) {
            request.warningCount = (request.warningCount ?? 0) + 1;
            const warning: Warning = {
                code: "warning.consumption.request.AttributeShareRequest.onlyRelationships",
                message: "Not to every recipients of this request exist a relationship."
            };

            if (!request.warnings) {
                request.warnings = [];
            }
            request.warnings.push(warning);
        }

        const attributesObjects: AttributeDVO[] = [];
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
            name: name,
            request: {
                ...request.request,
                attributeObjects: attributesObjects,
                attributes: attributesShareRequest.attributes,
                recipientObjects: recipientObjects,
                recipients: attributesShareRequest.recipients,
                relationshipCount: relationshipCount
            }
        };
    }

    public expandConsumptionAttribute(attribute: ConsumptionAttributeDTO): AttributeDVO {
        return {
            id: attribute.id,
            name: `${attribute.content.name}: ${attribute.content.value}`,
            type: "Attribute",
            attribute: {
                ...attribute,
                isAvailable: true
            },
            date: attribute.createdAt
        };
    }

    public async expandConsumptionAttributes(attributes: ConsumptionAttributeDTO[]): Promise<AttributeDVO[]> {
        const attributesPromise = attributes.map((attribute) => this.expandConsumptionAttribute(attribute));
        return await Promise.all(attributesPromise);
    }

    public async expandAttributeName(name: string): Promise<AttributeDVO> {
        const consumptionAttribute = await this.consumption.attributes.getAttributeByName({ name: name });
        if (consumptionAttribute.isSuccess) {
            return this.expandConsumptionAttribute(consumptionAttribute.value);
        }
        return this.getUnknownAttribute(name);
    }

    public async expandAttributeNames(names: string[]): Promise<AttributeDVO[]> {
        const namesPromise = names.map((name) => this.expandAttributeName(name));
        return await Promise.all(namesPromise);
    }

    private getUnknownAttribute(name: string): AttributeDVO {
        return {
            id: name,
            type: "Attribute",
            name: DataViewTranslateable.consumption.attributes.unknownAttributeName,
            attribute: {
                content: {
                    "@type": "Attribute",
                    name: name
                },
                isAvailable: false
            }
        };
    }

    public expandAttribute(attribute: AttributeJSON): AttributeDVO {
        return {
            id: attribute.name,
            type: "Attribute",
            name: attribute.value,
            attribute: {
                ...attribute,
                isAvailable: false
            }
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
            if (!this.identityController.isMe(CoreAddress.from(attributesChangeRequest.applyTo))) {
                const result = await this.transport.relationships.getRelationshipByAddress({
                    address: attributesChangeRequest.applyTo
                });
                if (result.isSuccess) {
                    applyToObject = await this.expandRelationshipDTO(result.value);
                }
            }
        }

        let name: string;

        const attributesObjects: AttributeDVO[] = [];
        for (const attribute of attributesChangeRequest.attributes) {
            const attributeDVO = this.expandAttribute(attribute);
            attributesObjects.push(attributeDVO);
        }

        if (attributesObjects.length > 1) {
            name = DataViewTranslateable.consumption.requests.attributesChangeRequestNamePlural;
        } else {
            name = DataViewTranslateable.consumption.requests.attributesChangeRequestName;
        }

        return {
            ...request,
            name: name,
            request: {
                ...request.request,
                attributes: attributesChangeRequest.attributes,
                applyTo: attributesChangeRequest.applyTo,
                attributeObjects: attributesObjects,
                applyToObject: applyToObject
            }
        };
    }

    public expandSelf(): IdentityDVO {
        let identityProperties: PersonProperties | OrganizationProperties;
        const name = "";
        const initials = (name.match(/\b\w/g) ?? []).join("");
        const isPerson = true;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (isPerson) {
            identityProperties = {
                initials: initials,
                statusText: "",
                isPerson: true,
                familyName: "",
                givenName: "",
                salutation: ""
            };
        } else {
            identityProperties = {
                initials: initials,
                statusText: "",
                isOrganization: true,
                legalName: ""
            };
        }

        return {
            id: this.identityController.address.toString(),
            name: DataViewTranslateable.consumption.identities.self,
            type: "IdentityDVO",
            identity: identityProperties,
            isSelf: true
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
            throw result.error;
        }

        return await this.expandRelationshipDTO(result.value);
    }

    public async expandAddresses(addresses: string[]): Promise<IdentityDVO[]> {
        const relationshipPromises = addresses.map((address) => this.expandAddress(address));
        return await Promise.all(relationshipPromises);
    }

    public async expandRecipients(recipients: RecipientDTO[]): Promise<IdentityDVO[]> {
        const relationshipPromises = recipients.map((recipient) => this.expandAddress(recipient.address));
        return await Promise.all(relationshipPromises);
    }

    public async expandRelationshipDTO(relationship: RelationshipDTO): Promise<IdentityDVO> {
        let name = "";

        // TODO: Remove this hack once we store the info correctly on onboarding

        const relationshipInfoFacade = this.consumption.relationshipInfo as any;
        const consumptionController = relationshipInfoFacade.createRelationshipInfoUseCase.relationshipInfoController._parent;

        const singleRelationshipController = new SingleRelationshipController(consumptionController);
        await singleRelationshipController.initWithRelationshipId(CoreId.from(relationship.id));

        const relationshipInfoResult = await this.consumption.relationshipInfo.getRelationshipInfoByRelationship({ relationshipId: relationship.id });
        const relationshipInfo = relationshipInfoResult.value;

        name = relationshipInfo.userTitle ? relationshipInfo.userTitle : relationshipInfo.title;

        let statusText = "";
        if (relationship.status === RelationshipStatus.Pending && this.identityController.isMe(CoreAddress.from(relationship.changes[0].request.createdBy))) {
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

        const initials = (name.match(/\b\w/g) ?? []).join("");

        const identityProperties: PersonProperties | OrganizationProperties = {
            initials: initials,
            statusText: statusText,
            isPerson: true,
            familyName: "",
            givenName: "",
            salutation: ""
        };

        return {
            id: relationship.peer,
            name: name,
            description: statusText,
            date: relationship.changes[0].request.createdAt,
            image: "",
            type: "IdentityDVO",
            identity: identityProperties,
            relationship: {
                ...relationship
            },
            isSelf: false
        };
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
            id: file.id,
            name: file.title ? file.title : file.filename,
            type: "FileDVO",
            date: file.createdAt,
            image: "",
            file: {
                ...file,
                createdByObject: await this.expandAddress(file.createdBy)
            }
        };
    }

    public async expandFileDTOs(files: FileDTO[]): Promise<FileDVO[]> {
        const filePromises = files.map((file) => this.expandFileDTO(file));
        return await Promise.all(filePromises);
    }
}
