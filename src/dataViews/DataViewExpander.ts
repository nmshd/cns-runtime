import { Serializable, SerializableBase } from "@js-soft/ts-serval";
import { ConsumptionController } from "@nmshd/consumption";
import {
    CreateAttributeRequestItemJSON,
    IdentityAttribute,
    IdentityAttributeJSON,
    IdentityAttributeQueryJSON,
    MailJSON,
    ProposeAttributeRequestItemJSON,
    ReadAttributeRequestItemJSON,
    RelationshipAttribute,
    RelationshipAttributeJSON,
    RelationshipTemplateBody,
    RelationshipTemplateBodyJSON,
    RenderHints,
    RenderHintsEditType,
    RenderHintsJSON,
    RenderHintsTechnicalType,
    RequestItemGroupJSON,
    RequestItemJSON,
    RequestJSON,
    ShareAttributeRequestItemJSON,
    ValueHints,
    ValueHintsJSON
} from "@nmshd/content";
import { CoreAddress, CoreId, IdentityController, Realm, Relationship, RelationshipStatus } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import {
    CreateAttributeRequestItemDVO,
    FileDVO,
    IdentityDVO,
    ProposeAttributeRequestItemDVO,
    ReadAttributeRequestItemDVO,
    RelationshipTemplateDVO,
    RequestItemDVO,
    RequestItemGroupDVO,
    ShareAttributeRequestItemDVO
} from "..";
import { TransportServices } from "../extensibility";
import { ConsumptionServices } from "../extensibility/ConsumptionServices";
import {
    FileDTO,
    IdentityDTO,
    LocalAttributeDTO,
    LocalRequestDTO,
    LocalResponseDTO,
    MessageDTO,
    MessageWithAttachmentsDTO,
    RecipientDTO,
    RelationshipChangeDTO,
    RelationshipDTO,
    RelationshipTemplateDTO
} from "../types";
import { RuntimeErrors } from "../useCases";
import {
    LocalAttributeDVO,
    LocalRequestDVO,
    LocalResponseDVO,
    PeerAttributeDVO,
    ProcessedIdentityAttributeQueryDVO,
    RelationshipSettingDVO,
    RepositoryAttributeDVO,
    SharedToPeerAttributeDVO
} from "./consumption";
import {
    DecidableCreateAttributeRequestItemDVO,
    DecidableProposeAttributeRequestItemDVO,
    DecidableReadAttributeRequestItemDVO,
    DecidableShareAttributeRequestItemDVO
} from "./consumption/DecidableRequestItemDVOs";
import { PeerRelationshipTemplateDVO } from "./consumption/PeerRelationshipTemplateDVO";
import { DraftAttributeDVO, IdentityAttributeQueryDVO } from "./content/AttributeDVOs";
import { MailDVO, RequestMessageDVO } from "./content/MailDVOs";
import { RequestDVO } from "./content/RequestDVO";
import { DataViewObject } from "./DataViewObject";
import { DataViewTranslateable } from "./DataViewTranslateable";
import { MessageDVO, MessageStatus, RecipientDVO } from "./transport/MessageDVO";
import { RelationshipChangeDVO, RelationshipChangeResponseDVO, RelationshipDirection, RelationshipDVO } from "./transport/RelationshipDVO";

export class DataViewExpander {
    public constructor(
        @Inject private readonly transport: TransportServices,
        @Inject private readonly consumption: ConsumptionServices,
        @Inject private readonly consumptionController: ConsumptionController,
        @Inject private readonly identityController: IdentityController
    ) {}

    public async expand(content: any, expectedType?: string): Promise<DataViewObject | DataViewObject[]> {
        let type = expectedType;
        if (content["@type"]) {
            type = content["@type"];
        }

        if (Array.isArray(content)) {
            if (content.length > 0) {
                type = content[0]["@type"];
            } else return [];
        }

        if (!type) {
            throw RuntimeErrors.general.invalidPayload("No type found.");
        }
        switch (type) {
            case "Message":
                if (Array.isArray(content)) {
                    return await this.expandMessageDTOs(content as MessageDTO[]);
                }

                return await this.expandMessageDTO(content as MessageDTO);

            case "Attribute":
                if (Array.isArray(content)) {
                    return await this.expandAttributes(content);
                }

                return await this.expandAttribute(content);

            case "Address":
                if (Array.isArray(content)) {
                    return await this.expandAddresses(content as string[]);
                }

                return await this.expandAddress(content as string);

            case "FileId":
                if (Array.isArray(content)) {
                    return await this.expandFileIds(content as string[]);
                }

                return await this.expandFileId(content as string);

            case "File":
                if (Array.isArray(content)) {
                    return await this.expandFileDTOs(content as FileDTO[]);
                }

                return await this.expandFileDTO(content as FileDTO);

            case "Recipient":
                if (Array.isArray(content)) {
                    return await this.expandRecipientDTOs(content as RecipientDTO[]);
                }

                return await this.expandAddress(content as string);

            case "Relationship":
                if (Array.isArray(content)) {
                    return await this.expandRelationshipDTOs(content as RelationshipDTO[]);
                }

                return await this.expandRelationshipDTO(content as RelationshipDTO);

            case "LocalAttribute":
                if (Array.isArray(content)) {
                    return await this.expandLocalAttributeDTOs(content as LocalAttributeDTO[]);
                }

                return await this.expandLocalAttributeDTO(content as LocalAttributeDTO);
            default:
                throw RuntimeErrors.general.notImplemented();
        }
    }

    public async expandMessageDTO(message: MessageDTO | MessageWithAttachmentsDTO): Promise<MessageDVO | MailDVO | RequestMessageDVO> {
        const recipientRelationships = await this.expandRecipientDTOs(message.recipients);
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
            peer: peer,
            content: message.content
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

            return mailDVO;
        }

        if (message.content["@type"] === "Request") {
            let localRequest: LocalRequestDTO;
            if (isOwn) {
                const localRequestsResult = await this.consumption.outgoingRequests.getRequests({
                    query: { "source.reference": message.id }
                });
                if (localRequestsResult.value.length === 0) {
                    throw new Error("No LocalRequest has been found for this message id.");
                }
                if (localRequestsResult.value.length > 1) {
                    throw new Error("More than one LocalRequest has been found for this message id.");
                }
                localRequest = localRequestsResult.value[0];
            } else {
                const localRequestsResult = await this.consumption.incomingRequests.getRequests({
                    query: { "source.reference": message.id }
                });
                if (localRequestsResult.value.length === 0) {
                    throw new Error("No LocalRequest has been found for this message id.");
                }
                if (localRequestsResult.value.length > 1) {
                    throw new Error("More than one LocalRequest has been found for this message id.");
                }
                localRequest = localRequestsResult.value[0];
            }

            const requestMessageDVO: RequestMessageDVO = {
                ...messageDVO,
                type: "RequestMessageDVO",
                request: await this.expandLocalRequestDTO(localRequest)
            };
            return requestMessageDVO;
        }

        if (message.content["@type"] === "Response") {
            let localRequest: LocalRequestDTO;
            if (isOwn) {
                const localRequestsResult = await this.consumption.incomingRequests.getRequests({
                    query: { id: message.content.requestId }
                });

                if (localRequestsResult.value.length === 0) {
                    throw new Error("No LocalRequest has been found for this message id.");
                }
                if (localRequestsResult.value.length > 1) {
                    throw new Error("More than one LocalRequest has been found for this message id.");
                }
                localRequest = localRequestsResult.value[0];
            } else {
                const localRequestsResult = await this.consumption.outgoingRequests.getRequests({
                    query: { id: message.content.requestId }
                });
                if (localRequestsResult.value.length === 0) {
                    throw new Error("No LocalRequest has been found for this message id.");
                }
                if (localRequestsResult.value.length > 1) {
                    throw new Error("More than one LocalRequest has been found for this message id.");
                }
                localRequest = localRequestsResult.value[0];
            }

            const requestMessageDVO: RequestMessageDVO = {
                ...messageDVO,
                type: "RequestMessageDVO",
                request: await this.expandLocalRequestDTO(localRequest)
            };
            return requestMessageDVO;
        }

        return messageDVO;
    }

    public async expandMessageDTOs(messages: MessageDTO[]): Promise<(MessageDVO | MailDVO | RequestMessageDVO)[]> {
        const messagePromises = messages.map((message) => this.expandMessageDTO(message));
        return await Promise.all(messagePromises);
    }

    public async expandRelationshipTemplateDTO(template: RelationshipTemplateDTO): Promise<PeerRelationshipTemplateDVO | RelationshipTemplateDVO> {
        let onNewRelationship: RequestDVO | undefined;
        let onExistingRelationship: RequestDVO | undefined;
        let name = "i18n://dvo.template.name";
        if (template.content["@type"] === "RelationshipTemplateBody") {
            const templateBody = RelationshipTemplateBody.from(template.content).toJSON() as RelationshipTemplateBodyJSON;
            if (templateBody.title) {
                name = templateBody.title;
            }
            let localRequest;
            if (!template.isOwn) {
                const onNewRelationshipRequest = await this.consumption.incomingRequests.getRequests({
                    query: {
                        "source.reference": template.id
                    }
                });
                localRequest = onNewRelationshipRequest.value[0];

                return {
                    name,
                    type: "PeerRelationshipTemplateDVO",
                    date: template.createdAt,
                    ...template,
                    createdBy: await this.expandAddress(template.createdBy),
                    onNewRelationship: await this.expandLocalRequestDTO(localRequest)
                };
            }

            onNewRelationship = await this.expandRequest(templateBody.onNewRelationship);
            if (templateBody.onExistingRelationship) {
                onExistingRelationship = await this.expandRequest(templateBody.onExistingRelationship);
            }
        }
        return {
            name,
            type: "RelationshipTemplateDVO",
            date: template.createdAt,
            ...template,
            createdBy: await this.expandAddress(template.createdBy),
            onNewRelationship,
            onExistingRelationship
        };
    }

    public async expandRelationshipTemplateDTOs(templates: RelationshipTemplateDTO[]): Promise<(PeerRelationshipTemplateDVO | RelationshipTemplateDVO)[]> {
        const templatePromises = templates.map((template) => this.expandRelationshipTemplateDTO(template));
        return await Promise.all(templatePromises);
    }

    public async expandRequest(request: RequestJSON, localRequestDTO?: LocalRequestDTO): Promise<RequestDVO> {
        const id = request.id ? request.id : "";
        const itemDVOs = [];
        for (const requestItem of request.items) {
            itemDVOs.push(await this.expandRequestGroupOrItem(requestItem, localRequestDTO));
        }
        return {
            id: id,
            name: `${request["@type"]} ${id}`,
            type: "RequestDVO",
            date: request.expiresAt,
            ...request,
            items: itemDVOs
        };
    }

    /*
    public async expandRequests(requests: RequestJSON[]): Promise<RequestDVO[]> {
        const requestPromises = requests.map((request) => this.expandRequest(request));
        return await Promise.all(requestPromises);
    }
    */

    public async expandRequestItem(requestItem: RequestItemJSON, localRequestDTO?: LocalRequestDTO): Promise<RequestItemDVO> {
        let isDecidable = false;
        if (localRequestDTO && !localRequestDTO.isOwn && (localRequestDTO.status === "DecisionRequired" || localRequestDTO.status === "ManualDecisionRequired")) {
            isDecidable = true;
        }
        switch (requestItem["@type"]) {
            case "ReadAttributeRequestItem":
                const readAttributeRequestItem = requestItem as ReadAttributeRequestItemJSON;
                if (isDecidable) {
                    return {
                        ...readAttributeRequestItem,
                        type: "DecidableReadAttributeRequestItemDVO",
                        id: "",
                        name: requestItem.title ? requestItem.title : "i18n://dvo.requestItem.ReadAttributeRequestItem.name",
                        query: await this.processIdentityAttributeQuery(readAttributeRequestItem.query),
                        isDecidable
                    } as DecidableReadAttributeRequestItemDVO;
                }
                return {
                    ...readAttributeRequestItem,
                    type: "ReadAttributeRequestItemDVO",
                    id: "",
                    name: requestItem.title ? requestItem.title : "i18n://dvo.requestItem.ReadAttributeRequestItem.name",
                    query: this.expandIdentityAttributeQuery(readAttributeRequestItem.query),
                    isDecidable
                } as ReadAttributeRequestItemDVO;

            case "CreateAttributeRequestItem":
                const createAttributeRequestItem = requestItem as CreateAttributeRequestItemJSON;
                if (isDecidable) {
                    return {
                        ...createAttributeRequestItem,
                        type: "DecidableCreateAttributeRequestItemDVO",
                        id: "",
                        name: requestItem.title ? requestItem.title : "i18n://dvo.requestItem.CreateAttributeRequestItem.name",
                        attribute: await this.expandAttribute(createAttributeRequestItem.attribute),
                        isDecidable
                    } as DecidableCreateAttributeRequestItemDVO;
                }
                return {
                    ...createAttributeRequestItem,
                    type: "CreateAttributeRequestItemDVO",
                    id: "",
                    name: requestItem.title ? requestItem.title : "i18n://dvo.requestItem.CreateAttributeRequestItem.name",
                    attribute: await this.expandAttribute(createAttributeRequestItem.attribute),
                    isDecidable
                } as CreateAttributeRequestItemDVO;

            case "ProposeAttributeRequestItem":
                const proposeAttributeRequestItem = requestItem as ProposeAttributeRequestItemJSON;
                if (localRequestDTO) {
                    proposeAttributeRequestItem.attribute.owner = localRequestDTO.isOwn ? localRequestDTO.peer : this.identityController.address.toString();
                }

                if (isDecidable) {
                    return {
                        ...proposeAttributeRequestItem,
                        type: "DecidableProposeAttributeRequestItemDVO",
                        id: "",
                        name: requestItem.title ? requestItem.title : "i18n://dvo.requestItem.ProposeAttributeRequestItem.name",
                        attribute: await this.expandAttribute(proposeAttributeRequestItem.attribute),
                        query: await this.processIdentityAttributeQuery(proposeAttributeRequestItem.query),
                        isDecidable
                    } as DecidableProposeAttributeRequestItemDVO;
                }
                return {
                    ...proposeAttributeRequestItem,
                    type: "ProposeAttributeRequestItemDVO",
                    id: "",
                    name: requestItem.title ? requestItem.title : "i18n://dvo.requestItem.ProposeAttributeRequestItem.name",
                    attribute: await this.expandAttribute(proposeAttributeRequestItem.attribute),
                    query: this.expandIdentityAttributeQuery(proposeAttributeRequestItem.query),
                    isDecidable
                } as ProposeAttributeRequestItemDVO;

            case "ShareAttributeRequestItem":
                const shareAttributeRequestItem = requestItem as ShareAttributeRequestItemJSON;
                const attributeResult = await this.consumption.attributes.getAttribute({ id: shareAttributeRequestItem.attributeId });
                const attribute = attributeResult.value;
                const attributeDVO = await this.expandLocalAttributeDTO(attribute);
                const shareWith = await this.expandAddress(shareAttributeRequestItem.shareWith);
                if (isDecidable) {
                    return {
                        ...shareAttributeRequestItem,
                        type: "DecidableShareAttributeRequestItemDVO",
                        id: "",
                        name: requestItem.title ? requestItem.title : "i18n://dvo.requestItem.ProposeAttributeRequestItem.name",
                        attribute: attributeDVO,
                        shareWith,
                        isDecidable
                    } as DecidableShareAttributeRequestItemDVO;
                }
                return {
                    ...shareAttributeRequestItem,
                    type: "ShareAttributeRequestItemDVO",
                    id: "",
                    name: requestItem.title ? requestItem.title : "i18n://dvo.requestItem.ProposeAttributeRequestItem.name",
                    attribute: attributeDVO,
                    shareWith,
                    isDecidable
                } as ShareAttributeRequestItemDVO;

            default:
                return {
                    ...requestItem,
                    type: "RequestItemDVO",
                    id: "",
                    name: requestItem.title ? requestItem.title : "i18n://dvo.requestItem.name",
                    isDecidable
                };
        }
    }

    public async expandRequestGroupOrItem(
        requestGroupOrItem: RequestItemGroupJSON | RequestItemJSON,
        localRequestDTO?: LocalRequestDTO
    ): Promise<RequestItemGroupDVO | RequestItemDVO> {
        if (requestGroupOrItem["@type"] === "RequestItemGroup") {
            let isDecidable = false;
            if (localRequestDTO && !localRequestDTO.isOwn && (localRequestDTO.status === "DecisionRequired" || localRequestDTO.status === "ManualDecisionRequired")) {
                isDecidable = true;
            }

            const group = requestGroupOrItem as RequestItemGroupJSON;
            const itemDVOs = [];
            for (const requestItem of group.items) {
                itemDVOs.push(await this.expandRequestItem(requestItem, localRequestDTO));
            }
            return {
                type: "RequestItemGroupDVO",
                items: itemDVOs,
                isDecidable,
                title: requestGroupOrItem.title,
                description: requestGroupOrItem.description,
                mustBeAccepted: requestGroupOrItem.mustBeAccepted
            };
        }
        return await this.expandRequestItem(requestGroupOrItem, localRequestDTO);
    }

    public async expandLocalRequestDTO(request: LocalRequestDTO): Promise<LocalRequestDVO> {
        const requestDVO = await this.expandRequest(request.content, request);
        const peerDVO = await this.expandAddress(request.peer);
        let isDecidable = false;
        if (!request.isOwn && (request.status === "DecisionRequired" || request.status === "ManualDecisionRequired")) {
            isDecidable = true;
        }
        return {
            ...request,
            id: request.id,
            content: requestDVO,
            items: requestDVO.items,
            name: "i18n://dvo.localRequest.name",
            type: "LocalRequestDVO",
            date: request.createdAt,
            createdBy: request.isOwn ? this.expandSelf() : peerDVO,
            decider: request.isOwn ? peerDVO : this.expandSelf(),
            peer: peerDVO,
            response: request.response ? this.expandLocalResponseDTO(request.response) : undefined,
            statusText: `i18n://dvo.localRequest.status.${request.status}`,
            isDecidable
        };
    }

    public expandLocalResponseDTO(response: LocalResponseDTO): LocalResponseDVO {
        return {
            ...response,
            id: "",
            name: "i18n://dvo.localResponse.name",
            type: "LocalResponseDVO",
            date: response.createdAt
        };
    }

    public async expandLocalAttributeDTO(attribute: LocalAttributeDTO): Promise<RepositoryAttributeDVO | SharedToPeerAttributeDVO | PeerAttributeDVO> {
        const valueType = attribute.content.value["@type"];
        const localAttribute = await this.consumptionController.attributes.getLocalAttribute(CoreId.from(attribute.id));
        if (!localAttribute) {
            throw new Error("Attribute not found");
        }
        const owner = attribute.content.owner;

        let name = `i18n://dvo.attribute.name.${valueType}`;
        let description = `i18n://dvo.attribute.description.${valueType}`;
        if (localAttribute.content instanceof RelationshipAttribute) {
            name = "";
            description = "";
        }
        const renderHints = localAttribute.content.value.renderHints.toJSON();
        const valueHints = localAttribute.content.value.valueHints.toJSON();

        if (localAttribute.shareInfo) {
            const peer = localAttribute.shareInfo.peer.toString();
            if (localAttribute.shareInfo.sourceAttribute) {
                // Own Shared Attribute
                return {
                    type: "SharedToPeerAttributeDVO",
                    id: attribute.id,
                    name,
                    description,
                    content: attribute.content,
                    value: attribute.content.value,
                    date: attribute.createdAt,
                    owner: owner,
                    renderHints,
                    valueHints,
                    isValid: true,
                    createdAt: attribute.createdAt,
                    isOwn: true,
                    peer: peer,
                    isDraft: false,
                    requestReference: localAttribute.shareInfo.requestReference.toString(),
                    sourceAttribute: localAttribute.shareInfo.sourceAttribute.toString(),
                    tags: []
                };
            }

            // Peer Attribute
            return {
                type: "PeerAttributeDVO",
                id: attribute.id,
                name,
                description,
                content: attribute.content,
                value: attribute.content.value,
                date: attribute.createdAt,
                owner: owner,
                renderHints,
                valueHints,
                isValid: true,
                createdAt: attribute.createdAt,
                isOwn: false,
                peer: peer,
                isDraft: false,
                requestReference: localAttribute.shareInfo.requestReference.toString(),
                tags: []
            };
        }

        const sharedToPeerAttributes = await this.consumption.attributes.getAttributes({ query: { "shareInfo.sourceAttribute": attribute.id } });
        const sharedToPeerDVOs = await this.expandLocalAttributeDTOs(sharedToPeerAttributes.value);

        // Own Source Attribute
        return {
            type: "RepositoryAttributeDVO",
            id: attribute.id,
            name,
            description,
            content: attribute.content,
            value: attribute.content.value,
            date: attribute.createdAt,
            owner: owner,
            renderHints,
            valueHints,
            isValid: true,
            createdAt: attribute.createdAt,
            isOwn: true,
            isDraft: false,
            sharedWith: sharedToPeerDVOs as SharedToPeerAttributeDVO[],
            tags: []
        };
    }

    public async expandLocalAttributeDTOs(attributes: LocalAttributeDTO[]): Promise<(RepositoryAttributeDVO | SharedToPeerAttributeDVO | PeerAttributeDVO)[]> {
        const attributesPromise = attributes.map((attribute) => this.expandLocalAttributeDTO(attribute));
        return await Promise.all(attributesPromise);
    }

    public expandIdentityAttributeQuery(query: IdentityAttributeQueryJSON): IdentityAttributeQueryDVO {
        const valueType = query.valueType;
        const name = `i18n://dvo.attribute.name.${valueType}`;
        const description = `i18n://dvo.attribute.description.${valueType}`;

        const valueTypeClass = SerializableBase.getModule(valueType, 1);
        if (!valueTypeClass) {
            throw new Error(`No class implementation found for ${valueType}`);
        }
        let renderHints: RenderHintsJSON = {
            "@type": "RenderHints",
            editType: RenderHintsEditType.InputLike,
            technicalType: RenderHintsTechnicalType.String
        };
        let valueHints: ValueHintsJSON = {
            "@type": "ValueHints",
            max: 200
        };
        if (valueTypeClass.renderHints && valueTypeClass.renderHints instanceof RenderHints) {
            renderHints = valueTypeClass.renderHints.toJSON();
        }
        if (valueTypeClass.valueHints && valueTypeClass.valueHints instanceof ValueHints) {
            valueHints = valueTypeClass.valueHints.toJSON();
        }

        return {
            type: "IdentityAttributeQueryDVO",
            id: "",
            name,
            description,
            valueType,
            validFrom: query.validFrom,
            validTo: query.validTo,
            renderHints,
            valueHints,
            isProcessed: false
        };
    }

    public async processIdentityAttributeQuery(query: IdentityAttributeQueryJSON): Promise<ProcessedIdentityAttributeQueryDVO> {
        const matchedAttributeDTOs = await this.consumption.attributes.executeIdentityAttributeQuery({
            query
        });
        const matchedAttributeDVOs = await this.expandLocalAttributeDTOs(matchedAttributeDTOs.value);
        const valueType = query.valueType;
        const name = `i18n://dvo.attribute.name.${valueType}`;
        const description = `i18n://dvo.attribute.description.${valueType}`;

        const valueTypeClass = SerializableBase.getModule(valueType, 1);
        if (!valueTypeClass) {
            throw new Error(`No class implementation found for ${valueType}`);
        }
        let renderHints: RenderHintsJSON = {
            "@type": "RenderHints",
            editType: RenderHintsEditType.InputLike,
            technicalType: RenderHintsTechnicalType.String
        };
        let valueHints: ValueHintsJSON = {
            "@type": "ValueHints",
            max: 200
        };
        if (valueTypeClass.renderHints && valueTypeClass.renderHints instanceof RenderHints) {
            renderHints = valueTypeClass.renderHints.toJSON();
        }
        if (valueTypeClass.valueHints && valueTypeClass.valueHints instanceof ValueHints) {
            valueHints = valueTypeClass.valueHints.toJSON();
        }

        return {
            type: "ProcessedIdentityAttributeQueryDVO",
            id: "",
            name,
            description,
            valueType,
            validFrom: query.validFrom,
            validTo: query.validTo,
            results: matchedAttributeDVOs as (RepositoryAttributeDVO | SharedToPeerAttributeDVO)[],
            renderHints,
            valueHints,
            isProcessed: true
        };
    }

    public async expandAttribute(attribute: IdentityAttributeJSON | RelationshipAttributeJSON): Promise<DraftAttributeDVO> {
        const attributeInstance = Serializable.fromAny(attribute) as IdentityAttribute | RelationshipAttribute;
        const valueType = attribute.value["@type"];
        let name = `i18n://dvo.attribute.name.${valueType}`;
        let description = `i18n://dvo.attribute.description.${valueType}`;
        const renderHints = attributeInstance.value.renderHints.toJSON();
        const valueHints = attributeInstance.value.valueHints.toJSON();
        if (attributeInstance instanceof RelationshipAttribute) {
            name = ""; // attributeInstance.value.title;
            description = ""; // attributeInstance.value.description;
        }

        const owner = await this.expandAddress(attribute.owner);
        return {
            type: "DraftAttributeDVO",
            content: attribute,
            name,
            description,
            id: "",
            owner: owner,
            renderHints,
            valueHints,
            value: attribute.value,
            isDraft: true,
            isOwn: owner.isSelf
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
            id: address,
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

    public async expandRecipientDTO(recipient: RecipientDTO): Promise<RecipientDVO> {
        const identity = await this.expandAddress(recipient.address);
        return {
            ...identity,
            type: "RecipientDVO",
            receivedAt: recipient.receivedAt,
            receivedByDevice: recipient.receivedByDevice
        };
    }

    public async expandRecipientDTOs(recipients: RecipientDTO[]): Promise<RecipientDVO[]> {
        const relationshipPromises = recipients.map((recipient) => this.expandRecipientDTO(recipient));
        return await Promise.all(relationshipPromises);
    }

    public expandRelationshipChangeDTO(relationship: RelationshipDTO, change: RelationshipChangeDTO): Promise<RelationshipChangeDVO> {
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

    public async expandRelationshipChangeDTOs(relationship: RelationshipDTO): Promise<RelationshipChangeDVO[]> {
        const changePromises = relationship.changes.map((change) => this.expandRelationshipChangeDTO(relationship, change));
        return await Promise.all(changePromises);
    }

    private async createRelationshipDVO(relationship: RelationshipDTO): Promise<RelationshipDVO> {
        let relationshipSetting: RelationshipSettingDVO;
        const settingResult = await this.consumption.settings.getSettings({ query: { reference: relationship.id } });
        if (settingResult.value.length > 0) {
            relationshipSetting = settingResult.value[0].value;
        } else {
            relationshipSetting = {
                isPinned: false
            };
        }

        const nameRelevantAttributeTypes = ["DisplayName", "GivenName", "MiddleName", "Surname", "Sex"];
        const stringByType: Record<string, undefined | string> = {};
        const relationshipAttributesResult = await this.consumption.attributes.getPeerAttributes({ onlyValid: true, peer: relationship.peer });
        const expandedAttributes = await this.expandLocalAttributeDTOs(relationshipAttributesResult.value);
        const attributesByType: Record<string, undefined | LocalAttributeDVO[]> = {};
        for (const attribute of expandedAttributes) {
            const valueType = attribute.content.value["@type"];
            const item = attributesByType[valueType];
            if (item) {
                item.push(attribute);
            } else {
                attributesByType[valueType] = [attribute];
            }

            if (nameRelevantAttributeTypes.includes(valueType)) {
                if (stringByType[valueType]) {
                    stringByType[valueType] += ` ${attribute.content.value.value}`;
                } else {
                    stringByType[valueType] = `${attribute.content.value.value}`;
                }
            }
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

        const changes = await this.expandRelationshipChangeDTOs(relationship);

        let name;
        if (stringByType["DisplayName"]) {
            name = stringByType["DisplayName"];
        } else if (stringByType["GivenName"] && stringByType["Surname"]) {
            name = `${stringByType["GivenName"]} ${stringByType["Surname"]}`;
        } else if (stringByType["Sex"] && stringByType["Surname"]) {
            name = `i18n://dvo.identity.Salutation.${stringByType["Sex"]} ${stringByType["Surname"]}`;
        } else {
            name = relationship.peer.substring(3, 9);
        }

        return {
            id: relationship.id,
            name: relationshipSetting.userTitle ?? name,
            description: relationshipSetting.userDescription ?? statusText,
            date: relationship.changes[0].request.createdAt,
            image: "",
            type: "RelationshipDVO",
            status: relationship.status,
            statusText: statusText,
            direction: direction,
            isPinned: relationshipSetting.isPinned,
            attributeMap: attributesByType,
            items: expandedAttributes,
            nameMap: stringByType,
            changes: changes,
            changeCount: changes.length
        };
    }

    public async expandRelationshipDTO(relationship: RelationshipDTO): Promise<IdentityDVO> {
        const relationshipDVO = await this.createRelationshipDVO(relationship);
        const initials = (relationshipDVO.name.match(/\b\w/g) ?? []).join("");

        return {
            type: "IdentityDVO",
            id: relationship.peer,
            name: relationshipDVO.name,
            date: relationshipDVO.date,
            description: relationshipDVO.description,
            publicKey: relationship.peerIdentity.publicKey,
            realm: relationship.peerIdentity.realm,
            initials,
            isSelf: false,
            hasRelationship: true,
            relationship: relationshipDVO,
            items: relationshipDVO.items
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

    public async expandIdentityDTO(identity: IdentityDTO): Promise<IdentityDVO> {
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
            createdBy: await this.expandAddress(file.createdBy)
        };
    }

    public async expandFileDTOs(files: FileDTO[]): Promise<FileDVO[]> {
        const filePromises = files.map((file) => this.expandFileDTO(file));
        return await Promise.all(filePromises);
    }
}
