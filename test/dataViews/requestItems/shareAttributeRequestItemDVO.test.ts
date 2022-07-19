import { EventBus } from "@js-soft/ts-utils";
import { AcceptShareAttributeRequestItemParametersJSON } from "@nmshd/consumption";
import { AcceptResponseItemJSON, CreateAttributeAcceptResponseItemJSON, CreateAttributeRequestItem, IAbstractStringJSON, ShareAttributeRequestItem } from "@nmshd/content";
import { DecidableCreateAttributeRequestItemDVO, DecidableShareAttributeRequestItemDVO } from "src/dataViews/consumption/DecidableRequestItemDVOs";
import {
    ConsumptionServices,
    CreateAttributeRequestItemDVO,
    DataViewExpander,
    IncomingRequestStatusChangedEvent,
    MessageDTO,
    OutgoingRequestStatusChangedEvent,
    RequestMessageDVO,
    ShareAttributeRequestItemDVO,
    TransportServices
} from "../../../src";
import { establishRelationship, RuntimeServiceProvider, sendMessage, syncUntilHasMessages, waitForEvent } from "../../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let transportServices2: TransportServices;
let transportServices3: TransportServices;
let expander1: DataViewExpander;
let expander2: DataViewExpander;
let expander3: DataViewExpander;
let consumptionServices1: ConsumptionServices;
let consumptionServices2: ConsumptionServices;
let consumptionServices3: ConsumptionServices;
let address1: string;
let address2: string;
let address3: string;
let eventBus1: EventBus;
let eventBus2: EventBus;
let eventBus3: EventBus;
let senderMessage: MessageDTO;
let recipientMessage: MessageDTO;
let shareAttributeId: string;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(3, { enableRequestModule: true });
    transportServices1 = runtimeServices[0].transport;
    transportServices2 = runtimeServices[1].transport;
    transportServices3 = runtimeServices[2].transport;
    expander1 = runtimeServices[0].expander;
    expander2 = runtimeServices[1].expander;
    expander3 = runtimeServices[2].expander;
    consumptionServices1 = runtimeServices[0].consumption;
    consumptionServices2 = runtimeServices[1].consumption;
    consumptionServices3 = runtimeServices[2].consumption;
    eventBus1 = runtimeServices[0].eventBus;
    eventBus2 = runtimeServices[1].eventBus;
    eventBus3 = runtimeServices[2].eventBus;

    await establishRelationship(transportServices1, transportServices2);
    await establishRelationship(transportServices1, transportServices3);
    await establishRelationship(transportServices2, transportServices3);

    address1 = (await transportServices1.account.getIdentityInfo()).value.address;
    address2 = (await transportServices2.account.getIdentityInfo()).value.address;
    address3 = (await transportServices3.account.getIdentityInfo()).value.address;

    const givenNameResult = await consumptionServices2.attributes.createAttribute({
        content: {
            "@type": "IdentityAttribute",
            owner: address2,
            value: {
                "@type": "GivenName",
                value: "Marlene"
            }
        }
    });
    const givenNameId = givenNameResult.value.id;

    const surnameResult = await consumptionServices2.attributes.createAttribute({
        content: {
            "@type": "IdentityAttribute",
            owner: address2,
            value: {
                "@type": "Surname",
                value: "Weigl"
            }
        }
    });
    const surnameId = surnameResult.value.id;

    const localRequest = await consumptionServices2.outgoingRequests.create({
        content: {
            items: [
                CreateAttributeRequestItem.fromAny({
                    mustBeAccepted: true,
                    attribute: givenNameResult.value.content,
                    sourceAttributeId: givenNameId
                }),
                CreateAttributeRequestItem.fromAny({
                    mustBeAccepted: true,
                    attribute: surnameResult.value.content,
                    sourceAttributeId: surnameId
                })
            ]
        },
        peer: address1
    });

    senderMessage = await sendMessage(transportServices2, address1, localRequest.value.content);

    const waitForIncomingRequest = waitForEvent(eventBus1, IncomingRequestStatusChangedEvent, 50000);
    const messages = await syncUntilHasMessages(transportServices1, 1);
    if (messages.length < 1) {
        throw new Error("Not enough messages synced");
    }
    recipientMessage = messages[0];
    await waitForIncomingRequest;

    const acceptResult = await consumptionServices1.incomingRequests.accept({
        requestId: localRequest.value.id,
        items: [{ accept: true }, { accept: true }]
    });
    if (acceptResult.isError) {
        throw acceptResult.error;
    }

    const waitForOutgoingRequestCreatedAndCompleted = waitForEvent(eventBus2, OutgoingRequestStatusChangedEvent, 50000);
    const senderMessages = await syncUntilHasMessages(transportServices2, 1);

    if (senderMessages.length < 1) {
        throw new Error("Not enough messages synced");
    }

    await waitForOutgoingRequestCreatedAndCompleted;
}, 30000);

afterAll(() => serviceProvider.stop());

describe("ShareAttributeRequestItemDVO", () => {
    test("check the prerequisites for identity 1 (share sender)", async () => {
        const givenNameResult = await consumptionServices1.attributes.getAttributes({
            query: { content: { value: { "@type": "GivenName" } }, shareInfo: { peer: address2 } }
        });
        expect(givenNameResult).toBeSuccessful();
        expect(givenNameResult.value).toHaveLength(1);
        expect(givenNameResult.value[0].id).toBeDefined();
        expect((givenNameResult.value[0].content.value as any).value).toBe("Marlene");
        shareAttributeId = givenNameResult.value[0].id;

        const givenNameResult2 = await consumptionServices1.attributes.getPeerAttributes({
            peer: address2,
            query: { content: { value: { "@type": "GivenName" } } }
        });
        expect(givenNameResult2).toBeSuccessful();
        expect(givenNameResult2.value).toHaveLength(1);
        expect(givenNameResult2.value[0].id).toBeDefined();
        expect((givenNameResult2.value[0].content.value as any).value).toBe("Marlene");
        expect(shareAttributeId).toStrictEqual(givenNameResult2.value[0].id);
    });
    test("check the prerequisites for identity 2 (attribute owner)", async () => {
        const givenNameResult = await consumptionServices2.attributes.getAttributes({
            query: { content: { value: { "@type": "GivenName" } }, shareInfo: { peer: address1 } }
        });
        expect(givenNameResult).toBeSuccessful();
        expect(givenNameResult.value[0].id).toBeDefined();
        expect((givenNameResult.value[0].content.value as any).value).toBe("Marlene");
        expect(givenNameResult.value[0].id).toStrictEqual(shareAttributeId);
    });
    test("create, send and wait for the share request", async () => {
        const localRequest = await consumptionServices1.outgoingRequests.create({
            content: {
                items: [
                    ShareAttributeRequestItem.fromAny({
                        mustBeAccepted: true,
                        attributeId: shareAttributeId,
                        shareWith: address3
                    })
                ]
            },
            peer: address2
        });
        expect(localRequest).toBeSuccessful();

        senderMessage = await sendMessage(transportServices1, address2, localRequest.value.content);

        const messages = await syncUntilHasMessages(transportServices2, 1);
        if (messages.length < 1) {
            throw new Error("Not enough messages synced");
        }
        recipientMessage = messages[0];
        expect(recipientMessage).toBeDefined();
    });

    test("check the MessageDVO for the sender", async () => {
        const dto = senderMessage;
        const dvo = (await expander1.expandMessageDTO(senderMessage)) as RequestMessageDVO;
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.id);
        expect(dvo.name).toBe("i18n://dvo.message.name");
        expect(dvo.type).toBe("RequestMessageDVO");
        expect(dvo.date).toBe(dto.createdAt);
        expect(dvo.request).toBeDefined();
        expect(dvo.request.isOwn).toBe(true);
        expect(dvo.request.status).toBe("Open");
        expect(dvo.request.statusText).toBe("i18n://dvo.localRequest.status.Open");
        expect(dvo.request.type).toBe("LocalRequestDVO");
        expect(dvo.request.content.type).toBe("RequestDVO");
        expect(dvo.request.content.items).toHaveLength(1);
        expect(dvo.request.isDecidable).toBe(false);
        const requestItemDVO = dvo.request.content.items[0] as ShareAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("ShareAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(false);

        expect(requestItemDVO.attributeId).toStrictEqual(shareAttributeId);
        expect(requestItemDVO.mustBeAccepted).toBe(true);
        expect(requestItemDVO.attribute).toBeDefined();
        expect(requestItemDVO.attribute.type).toBe("PeerAttributeDVO");
        const value = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("GivenName");
        expect(value.value).toBe("Marlene");
        expect(requestItemDVO.attribute.renderHints.technicalType).toBe("String");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(false);
        expect(requestItemDVO.attribute.isOwn).toBe(false);
    });

    test("check the MessageDVO for the recipient and accept it", async () => {
        const dto = recipientMessage;
        const dvo = (await expander2.expandMessageDTO(recipientMessage)) as RequestMessageDVO;
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.id);
        expect(dvo.name).toBe("i18n://dvo.message.name");
        expect(dvo.type).toBe("RequestMessageDVO");
        expect(dvo.date).toBe(dto.createdAt);
        expect(dvo.request).toBeDefined();
        expect(dvo.request.isOwn).toBe(false);
        expect(dvo.request.status).toBe("DecisionRequired");
        expect(dvo.request.statusText).toBe("i18n://dvo.localRequest.status.DecisionRequired");
        expect(dvo.request.type).toBe("LocalRequestDVO");
        expect(dvo.request.content.type).toBe("RequestDVO");
        expect(dvo.request.content.items).toHaveLength(1);
        expect(dvo.request.isDecidable).toBe(true);
        const requestItemDVO = dvo.request.content.items[0] as DecidableShareAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("DecidableShareAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(true);

        expect(requestItemDVO.attribute).toBeDefined();
        expect(requestItemDVO.attribute.type).toBe("SharedToPeerAttributeDVO");
        const value = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("GivenName");
        expect(value.value).toBe("Marlene");
        expect(requestItemDVO.attribute.renderHints.technicalType).toBe("String");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(false);
        expect(requestItemDVO.attribute.isOwn).toBe(true);

        expect(requestItemDVO.shareWith).toBeDefined();
        expect(requestItemDVO.shareWith.id).toStrictEqual(address3);

        expect(requestItemDVO.mustBeAccepted).toBe(true);

        const acceptResult = await consumptionServices2.incomingRequests.accept({
            requestId: dvo.request.id,
            items: [{ accept: true } as AcceptShareAttributeRequestItemParametersJSON]
        });
        expect(acceptResult).toBeSuccessful();
    });

    test("check the MessageDVO for identity 2 after acceptance", async () => {
        const dto = recipientMessage;
        const dvo = (await expander2.expandMessageDTO(recipientMessage)) as RequestMessageDVO;
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.id);
        expect(dvo.name).toBe("i18n://dvo.message.name");
        expect(dvo.type).toBe("RequestMessageDVO");
        expect(dvo.date).toBe(dto.createdAt);
        expect(dvo.request).toBeDefined();
        expect(dvo.request.isOwn).toBe(false);
        expect(dvo.request.status).toBe("Decided");
        expect(dvo.request.statusText).toBe("i18n://dvo.localRequest.status.Decided");
        expect(dvo.request.type).toBe("LocalRequestDVO");
        expect(dvo.request.content.type).toBe("RequestDVO");
        expect(dvo.request.content.items).toHaveLength(1);
        expect(dvo.request.isDecidable).toBe(false);
        const requestItemDVO = dvo.request.content.items[0] as ShareAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("ShareAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(false);
        expect(requestItemDVO.mustBeAccepted).toBe(true);

        expect(requestItemDVO.attribute).toBeDefined();
        expect(requestItemDVO.attribute.type).toBe("SharedToPeerAttributeDVO");
        const value = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("GivenName");
        expect(value.value).toBe("Marlene");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(false);
        expect(requestItemDVO.attribute.isOwn).toBe(true);

        const response = dvo.request.response;
        expect(response).toBeDefined();
        expect(response!.type).toBe("LocalResponseDVO");
        expect(response!.name).toBe("i18n://dvo.localResponse.name");
        expect(response!.date).toBeDefined();
        expect(response!.content.result).toBe("Accepted");
        expect(response!.content.items).toHaveLength(1);
        const responseItem = response!.content.items[0] as AcceptResponseItemJSON;
        expect(responseItem.result).toBe("Accepted");
        expect(responseItem["@type"]).toBe("AcceptResponseItem");
    });

    test("check the MessageDVO for identity 1 after acceptance", async () => {
        const waitForOutgoingRequestCreatedAndCompleted = waitForEvent(eventBus1, OutgoingRequestStatusChangedEvent, 50000);
        const messages = await syncUntilHasMessages(transportServices1, 1);

        if (messages.length < 1) {
            throw new Error("Not enough messages synced");
        }
        await waitForOutgoingRequestCreatedAndCompleted;

        const dto = senderMessage;
        const dvo = (await expander1.expandMessageDTO(senderMessage)) as RequestMessageDVO;
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.id);
        expect(dvo.name).toBe("i18n://dvo.message.name");
        expect(dvo.type).toBe("RequestMessageDVO");
        expect(dvo.date).toBe(dto.createdAt);
        expect(dvo.request).toBeDefined();
        expect(dvo.request.isOwn).toBe(true);
        expect(dvo.request.status).toBe("Completed");
        expect(dvo.request.statusText).toBe("i18n://dvo.localRequest.status.Completed");
        expect(dvo.request.type).toBe("LocalRequestDVO");
        expect(dvo.request.content.type).toBe("RequestDVO");
        expect(dvo.request.content.items).toHaveLength(1);
        expect(dvo.request.isDecidable).toBe(false);
        const requestItemDVO = dvo.request.content.items[0] as ShareAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("ShareAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(false);
        expect(requestItemDVO.attributeId).toStrictEqual(shareAttributeId);
        expect(requestItemDVO.mustBeAccepted).toBe(true);

        expect(requestItemDVO.attribute).toBeDefined();
        expect(requestItemDVO.attribute.type).toBe("PeerAttributeDVO");
        const value = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("GivenName");
        expect(value.value).toBe("Marlene");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(false);
        expect(requestItemDVO.attribute.isOwn).toBe(false);

        const response = dvo.request.response;
        expect(response).toBeDefined();
        expect(response!.type).toBe("LocalResponseDVO");
        expect(response!.name).toBe("i18n://dvo.localResponse.name");
        expect(response!.date).toBeDefined();
        expect(response!.content.result).toBe("Accepted");
        expect(response!.content.items).toHaveLength(1);
        const responseItem = response!.content.items[0] as AcceptResponseItemJSON;
        expect(responseItem.result).toBe("Accepted");
        expect(responseItem["@type"]).toBe("AcceptResponseItem");
    });

    test("check the MessageDVO for identity 3 after acceptance", async () => {
        const waitForIncomingRequest = waitForEvent(eventBus3, IncomingRequestStatusChangedEvent, 50000);
        const messages = await syncUntilHasMessages(transportServices3, 1);
        if (messages.length < 1) {
            throw new Error("Not enough messages synced");
        }
        recipientMessage = messages[0];
        await waitForIncomingRequest;

        const dto = recipientMessage;
        const dvo = (await expander3.expandMessageDTO(recipientMessage)) as RequestMessageDVO;
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.id);
        expect(dvo.name).toBe("i18n://dvo.message.name");
        expect(dvo.type).toBe("RequestMessageDVO");
        expect(dvo.date).toBe(dto.createdAt);
        expect(dvo.request).toBeDefined();
        expect(dvo.request.isOwn).toBe(false);
        expect(dvo.request.status).toBe("DecisionRequired");
        expect(dvo.request.statusText).toBe("i18n://dvo.localRequest.status.DecisionRequired");
        expect(dvo.request.type).toBe("LocalRequestDVO");
        expect(dvo.request.content.type).toBe("RequestDVO");
        expect(dvo.request.content.items).toHaveLength(1);
        expect(dvo.request.isDecidable).toBe(true);
        const requestItemDVO = dvo.request.content.items[0] as DecidableCreateAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("DecidableCreateAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(true);
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        const value = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("GivenName");
        expect(value.value).toBe("Marlene");
        expect(requestItemDVO.attribute.renderHints.technicalType).toBe("String");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(true);
        expect(requestItemDVO.attribute.isOwn).toBe(false);
        expect(requestItemDVO.mustBeAccepted).toBe(true);

        const acceptResult = await consumptionServices3.incomingRequests.accept({
            requestId: dvo.request.id,
            items: [{ accept: true }]
        });
        expect(acceptResult).toBeSuccessful();
    });

    test("check the MessageDVO for identity3 after acceptance", async () => {
        const dto = recipientMessage;
        const dvo = (await expander3.expandMessageDTO(recipientMessage)) as RequestMessageDVO;
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.id);
        expect(dvo.name).toBe("i18n://dvo.message.name");
        expect(dvo.type).toBe("RequestMessageDVO");
        expect(dvo.date).toBe(dto.createdAt);
        expect(dvo.request).toBeDefined();
        expect(dvo.request.isOwn).toBe(false);
        expect(dvo.request.status).toBe("Decided");
        expect(dvo.request.statusText).toBe("i18n://dvo.localRequest.status.Decided");
        expect(dvo.request.type).toBe("LocalRequestDVO");
        expect(dvo.request.content.type).toBe("RequestDVO");
        expect(dvo.request.content.items).toHaveLength(1);
        expect(dvo.request.isDecidable).toBe(false);
        const requestItemDVO = dvo.request.content.items[0] as CreateAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("CreateAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(false);
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        const value = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("GivenName");
        expect(value.value).toBe("Marlene");
        expect(requestItemDVO.attribute.renderHints.technicalType).toBe("String");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(true);
        expect(requestItemDVO.attribute.isOwn).toBe(false);
        expect(requestItemDVO.mustBeAccepted).toBe(true);
        const response = dvo.request.response;
        expect(response).toBeDefined();
        expect(response!.type).toBe("LocalResponseDVO");
        expect(response!.name).toBe("i18n://dvo.localResponse.name");
        expect(response!.date).toBeDefined();
        expect(response!.content.result).toBe("Accepted");
        expect(response!.content.items).toHaveLength(1);
        const responseItem = response!.content.items[0] as CreateAttributeAcceptResponseItemJSON;
        expect(responseItem.result).toBe("Accepted");
        expect(responseItem["@type"]).toBe("CreateAttributeAcceptResponseItem");

        const attributeResult = await consumptionServices3.attributes.getAttributes({
            query: { content: { value: { "@type": "GivenName" } }, shareInfo: { peer: dvo.createdBy.id } }
        });
        expect(attributeResult).toBeSuccessful();
        expect(attributeResult.value[0].id).toBeDefined();
        expect((attributeResult.value[0].content.value as any).value).toBe("Marlene");

        expect(responseItem.attributeId).toStrictEqual(attributeResult.value[0].id);

        const attributeResult2 = await consumptionServices3.attributes.getPeerAttributes({
            peer: dvo.createdBy.id,
            query: { content: { value: { "@type": "GivenName" } } }
        });
        expect(attributeResult2).toBeSuccessful();
        expect(attributeResult2.value).toHaveLength(1);
        expect(attributeResult2.value[0].id).toBeDefined();
        expect((attributeResult2.value[0].content.value as any).value).toBe("Marlene");

        expect(responseItem.attributeId).toStrictEqual(attributeResult2.value[0].id);
    });

    test("check the MessageDVO for identity 2 after acceptance of identity 3", async () => {
        const waitForOutgoingRequestCreatedAndCompleted = waitForEvent(eventBus2, OutgoingRequestStatusChangedEvent, 50000);
        const messages = await syncUntilHasMessages(transportServices2, 1);

        if (messages.length < 1) {
            throw new Error("Not enough messages synced");
        }
        await waitForOutgoingRequestCreatedAndCompleted;
        senderMessage = messages[0];

        const dto = senderMessage;
        const dvo = (await expander2.expandMessageDTO(senderMessage)) as RequestMessageDVO;
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.id);
        expect(dvo.name).toBe("i18n://dvo.message.name");
        expect(dvo.type).toBe("RequestMessageDVO");
        expect(dvo.date).toBe(dto.createdAt);
        expect(dvo.request).toBeDefined();
        expect(dvo.request.isOwn).toBe(true);
        expect(dvo.request.status).toBe("Completed");
        expect(dvo.request.statusText).toBe("i18n://dvo.localRequest.status.Completed");
        expect(dvo.request.type).toBe("LocalRequestDVO");
        expect(dvo.request.content.type).toBe("RequestDVO");
        expect(dvo.request.content.items).toHaveLength(1);
        expect(dvo.request.isDecidable).toBe(false);
        const requestItemDVO = dvo.request.content.items[0] as CreateAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("CreateAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(false);
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        const value = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("GivenName");
        expect(value.value).toBe("Marlene");
        expect(requestItemDVO.attribute.renderHints.technicalType).toBe("String");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(true);
        expect(requestItemDVO.attribute.isOwn).toBe(true);
        expect(requestItemDVO.mustBeAccepted).toBe(true);
        const response = dvo.request.response;
        expect(response).toBeDefined();
        expect(response!.type).toBe("LocalResponseDVO");
        expect(response!.name).toBe("i18n://dvo.localResponse.name");
        expect(response!.date).toBeDefined();
        expect(response!.content.result).toBe("Accepted");
        expect(response!.content.items).toHaveLength(1);
        const responseItem = response!.content.items[0] as CreateAttributeAcceptResponseItemJSON;
        expect(responseItem.result).toBe("Accepted");
        expect(responseItem["@type"]).toBe("CreateAttributeAcceptResponseItem");
        expect(responseItem.attributeId).toBeDefined();

        const attributeResult = await consumptionServices2.attributes.getAttributes({
            query: { content: { value: { "@type": "GivenName" } }, shareInfo: { peer: dvo.request.peer.id } }
        });
        expect(attributeResult).toBeSuccessful();
        expect(attributeResult.value).toHaveLength(1);
        expect(attributeResult.value[0].id).toBeDefined();
        expect((attributeResult.value[0].content.value as any).value).toBe("Marlene");

        expect(responseItem.attributeId).toStrictEqual(attributeResult.value[0].id);

        const attributeResult2 = await consumptionServices2.attributes.getSharedToPeerAttributes({
            peer: address3,
            query: { content: { value: { "@type": "GivenName" } } }
        });
        expect(attributeResult2).toBeSuccessful();
        expect(attributeResult2.value).toHaveLength(1);
        expect(attributeResult2.value[0].id).toBeDefined();
        expect((attributeResult2.value[0].content.value as any).value).toBe("Marlene");

        expect(responseItem.attributeId).toStrictEqual(attributeResult2.value[0].id);
    });
});
