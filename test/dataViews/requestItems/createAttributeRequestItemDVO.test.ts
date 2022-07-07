import { EventBus } from "@js-soft/ts-utils";
import {
    CreateAttributeAcceptResponseItemJSON,
    GivenName,
    IdentityAttribute,
    ReadAttributeAcceptResponseItem,
    ReadAttributeRequestItem,
    ResponseItemResult,
    ResponseResult
} from "@nmshd/content";
import { CoreAddress, CoreId } from "@nmshd/transport";
import { DecidableCreateAttributeRequestItemDVO } from "src/dataViews/consumption/DecidableRequestItemDVOs";
import {
    ConsumptionServices,
    CreateAttributeRequestItemDVO,
    DataViewExpander,
    MessageDTO,
    OutgoingRequestStatusChangedEvent,
    RequestMessageDVO,
    TransportServices
} from "../../../src";
import { establishRelationshipWithBodys, RuntimeServiceProvider, sendMessage, syncUntilHasMessages, waitForEvent } from "../../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let transportServices2: TransportServices;
let expander1: DataViewExpander;
let expander2: DataViewExpander;
let consumptionServices1: ConsumptionServices;
let consumptionServices2: ConsumptionServices;
let eventBus1: EventBus;
let senderMessage: MessageDTO;
let recipientMessage: MessageDTO;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2, { enableRequestModule: true });
    transportServices1 = runtimeServices[0].transport;
    transportServices2 = runtimeServices[1].transport;
    expander1 = runtimeServices[0].expander;
    expander2 = runtimeServices[1].expander;
    consumptionServices1 = runtimeServices[0].consumption;
    consumptionServices2 = runtimeServices[1].consumption;
    eventBus1 = runtimeServices[0].eventBus;
    await establishRelationshipWithBodys(
        transportServices1,
        transportServices2,
        {
            onNewRelationship: {
                "@type": "Request",
                items: [
                    ReadAttributeRequestItem.from({
                        mustBeAccepted: true,
                        query: {
                            valueType: "GivenName"
                        }
                    })
                ]
            }
        },
        {
            response: {
                "@type": "Response",
                result: ResponseResult.Accepted,
                requestId: await CoreId.generate(),
                items: [
                    ReadAttributeAcceptResponseItem.from({
                        result: ResponseItemResult.Accepted,
                        attributeId: await CoreId.generate(),
                        attribute: IdentityAttribute.from({
                            owner: CoreAddress.from((await transportServices1.account.getIdentityInfo()).value.address),
                            value: GivenName.fromAny({
                                value: "AGivenName"
                            })
                        })
                    })
                ]
            }
        }
    );
    const senderAddress = (await transportServices1.account.getIdentityInfo()).value.address;
    const recipientAddress = (await transportServices2.account.getIdentityInfo()).value.address;

    const senderAttribute = await consumptionServices1.attributes.createAttribute({
        content: {
            "@type": "IdentityAttribute",
            owner: senderAddress,
            value: {
                "@type": "GivenName",
                value: "Theodor"
            }
        }
    });

    const localRequest = await consumptionServices1.outgoingRequests.create({
        content: {
            items: [
                {
                    "@type": "CreateAttributeRequestItem",
                    mustBeAccepted: true,
                    attribute: senderAttribute.value.content,
                    sourceAttributeId: senderAttribute.value.id
                }
            ]
        },
        peer: recipientAddress
    });

    senderMessage = await sendMessage(transportServices1, recipientAddress, localRequest.value.content);
    const messages = await syncUntilHasMessages(transportServices2, 1);
    if (messages.length < 1) {
        throw new Error("Not enough messages synced");
    }
    recipientMessage = messages[0];
}, 30000);

afterAll(() => serviceProvider.stop());

describe("CreateAttributeRequestItemDVO", () => {
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
        const requestItemDVO = dvo.request.content.items[0] as CreateAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("CreateAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(false);
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        expect(requestItemDVO.attribute.value["@type"]).toBe("GivenName");
        expect(requestItemDVO.attribute.value.value).toBe("Theodor");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(true);
        expect(requestItemDVO.attribute.isOwn).toBe(true);
        expect(requestItemDVO.mustBeAccepted).toBe(true);
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
        const requestItemDVO = dvo.request.content.items[0] as DecidableCreateAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("DecidableCreateAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(true);
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        expect(requestItemDVO.attribute.value["@type"]).toBe("GivenName");
        expect(requestItemDVO.attribute.value.value).toBe("Theodor");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(true);
        expect(requestItemDVO.attribute.isOwn).toBe(false);
        expect(requestItemDVO.mustBeAccepted).toBe(true);

        const acceptResult = await consumptionServices2.incomingRequests.accept({
            requestId: dvo.request.id,
            items: [{ accept: true }]
        });
        expect(acceptResult.isSuccess).toBe(true);
    });

    test("check the MessageDVO for the recipient after acceptance", async () => {
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
        const requestItemDVO = dvo.request.content.items[0] as CreateAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("CreateAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(false);
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        expect(requestItemDVO.attribute.value["@type"]).toBe("GivenName");
        expect(requestItemDVO.attribute.value.value).toBe("Theodor");
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

        const attributeResult = await consumptionServices2.attributes.getValidAttributes({
            query: { content: { value: { "@type": "GivenName" } }, shareInfo: { peer: dvo.createdBy.id } }
        });
        expect(attributeResult.isSuccess).toBe(true);
        expect(attributeResult.value[0].id).toBeDefined();
        expect((attributeResult.value[0].content.value as any).value).toBe("Theodor");

        expect(responseItem.attributeId).toStrictEqual(attributeResult.value[0].id);
    });

    test("check the MessageDVO for the sender after acceptance", async () => {
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
        const requestItemDVO = dvo.request.content.items[0] as CreateAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("CreateAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(false);
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        expect(requestItemDVO.attribute.value["@type"]).toBe("GivenName");
        expect(requestItemDVO.attribute.value.value).toBe("Theodor");
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

        const attributeResult = await consumptionServices1.attributes.getValidAttributes({
            query: { content: { value: { "@type": "GivenName" } }, shareInfo: { peer: dvo.request.peer.id } }
        });
        expect(attributeResult.isSuccess).toBe(true);
        expect(attributeResult.value[0].id).toBeDefined();
        expect((attributeResult.value[0].content.value as any).value).toBe("Theodor");

        expect(responseItem.attributeId).toStrictEqual(attributeResult.value[0].id);
    });
});
