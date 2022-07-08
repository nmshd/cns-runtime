import { EventBus } from "@js-soft/ts-utils";
import { AcceptProposeAttributeRequestItemParametersJSON, LocalRequestStatus } from "@nmshd/consumption";
import {
    GivenName,
    IAbstractStringJSON,
    IdentityAttribute,
    IdentityAttributeQuery,
    ProposeAttributeAcceptResponseItemJSON,
    ProposeAttributeRequestItem,
    Surname
} from "@nmshd/content";
import { CoreAddress } from "@nmshd/transport";
import { DecidableProposeAttributeRequestItemDVO } from "src/dataViews/consumption/DecidableRequestItemDVOs";
import {
    ConsumptionServices,
    DataViewExpander,
    IncomingRequestStatusChangedEvent,
    MessageDTO,
    OutgoingRequestStatusChangedEvent,
    ProposeAttributeRequestItemDVO,
    RequestMessageDVO,
    TransportServices
} from "../../../src";
import { establishRelationship, RuntimeServiceProvider, sendMessage, syncUntilHasMessages, waitForEvent } from "../../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let transportServices2: TransportServices;
let expander1: DataViewExpander;
let expander2: DataViewExpander;
let consumptionServices1: ConsumptionServices;
let consumptionServices2: ConsumptionServices;
let eventBus1: EventBus;
let eventBus2: EventBus;
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
    eventBus2 = runtimeServices[1].eventBus;
    await establishRelationship(transportServices1, transportServices2);
    // const senderAddress = (await transportServices1.account.getIdentityInfo()).value.address;
    const recipientAddress = (await transportServices2.account.getIdentityInfo()).value.address;

    await consumptionServices2.attributes.createAttribute({
        content: {
            "@type": "IdentityAttribute",
            owner: recipientAddress,
            value: {
                "@type": "GivenName",
                value: "Marlene"
            }
        }
    });

    await consumptionServices2.attributes.createAttribute({
        content: {
            "@type": "IdentityAttribute",
            owner: recipientAddress,
            value: {
                "@type": "Surname",
                value: "Weigl"
            }
        }
    });

    const localRequest = await consumptionServices1.outgoingRequests.create({
        content: {
            items: [
                ProposeAttributeRequestItem.from({
                    mustBeAccepted: true,

                    query: IdentityAttributeQuery.from({
                        valueType: "GivenName"
                    }),
                    attribute: IdentityAttribute.from({
                        owner: CoreAddress.from(recipientAddress),
                        value: GivenName.fromAny({
                            value: "Theodor"
                        })
                    })
                }),
                ProposeAttributeRequestItem.from({
                    mustBeAccepted: true,

                    query: IdentityAttributeQuery.from({
                        valueType: "Surname"
                    }),
                    attribute: IdentityAttribute.from({
                        owner: CoreAddress.from(recipientAddress),
                        value: Surname.fromAny({
                            value: "Weigl-Rostock"
                        })
                    })
                })
            ]
        },
        peer: recipientAddress
    });

    senderMessage = await sendMessage(transportServices1, recipientAddress, localRequest.value.content);

    const waitForIncomingRequestDecisionRequired = waitForEvent(
        eventBus2,
        IncomingRequestStatusChangedEvent,
        2000,
        (e) => e.data.newStatus === LocalRequestStatus.DecisionRequired
    );

    const messages = await syncUntilHasMessages(transportServices2, 1);
    if (messages.length < 1) {
        throw new Error("Not enough messages synced");
    }
    recipientMessage = messages[0];

    await waitForIncomingRequestDecisionRequired;
}, 30000);

afterAll(() => serviceProvider.stop());

describe("ProposeAttributeRequestItemDVO", () => {
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
        expect(dvo.request.content.items).toHaveLength(2);
        expect(dvo.request.isDecidable).toBe(false);
        const requestItemDVO = dvo.request.content.items[0] as ProposeAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("ProposeAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(false);
        expect(requestItemDVO.query).toBeDefined();
        expect(requestItemDVO.query.type).toBe("IdentityAttributeQueryDVO");
        expect((requestItemDVO.query as any).results).toBeUndefined();
        // expect(requestItemDVO.query.renderHints.dataType).toBe("String");
        expect(requestItemDVO.query.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.query.valueHints.max).toBe(200);
        expect(requestItemDVO.mustBeAccepted).toBe(true);
        expect(requestItemDVO.attribute).toBeDefined();
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        const value = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("GivenName");
        expect(value.value).toBe("Theodor");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(true);
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
        expect(dvo.request.content.items).toHaveLength(2);
        expect(dvo.request.isDecidable).toBe(true);
        let requestItemDVO = dvo.request.content.items[0] as DecidableProposeAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("DecidableProposeAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(true);

        expect(requestItemDVO.attribute).toBeDefined();
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        const givenNameValue = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(givenNameValue["@type"]).toBe("GivenName");
        expect(givenNameValue.value).toBe("Theodor");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(true);
        expect(requestItemDVO.attribute.isOwn).toBe(true);

        expect(requestItemDVO.query).toBeDefined();
        expect(requestItemDVO.query.type).toBe("ProcessedIdentityAttributeQueryDVO");
        expect(requestItemDVO.query.results).toHaveLength(1);
        // expect(requestItemDVO.query.renderHints.dataType).toBe("String");
        expect(requestItemDVO.query.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.query.valueHints.max).toBe(200);
        expect(requestItemDVO.mustBeAccepted).toBe(true);

        const resultItem = requestItemDVO.query.results[0];
        expect(resultItem.type).toBe("RepositoryAttributeDVO");
        expect(resultItem.content["@type"]).toBe("IdentityAttribute");
        expect(resultItem.content.value["@type"]).toBe("GivenName");
        expect((resultItem.content.value as any).value).toBe("Marlene");

        requestItemDVO = dvo.request.content.items[1] as DecidableProposeAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("DecidableProposeAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(true);

        expect(requestItemDVO.attribute).toBeDefined();
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        const value = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("Surname");
        expect(value.value).toBe("Weigl-Rostock");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(true);
        expect(requestItemDVO.attribute.isOwn).toBe(true);

        expect(requestItemDVO.query).toBeDefined();
        expect(requestItemDVO.query.type).toBe("ProcessedIdentityAttributeQueryDVO");
        expect(requestItemDVO.query.results).toHaveLength(1);
        // expect(requestItemDVO.query.renderHints.dataType).toBe("String");
        expect(requestItemDVO.query.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.query.valueHints.max).toBe(200);
        expect(requestItemDVO.mustBeAccepted).toBe(true);

        const resultItem2 = requestItemDVO.query.results[0];
        expect(resultItem2.type).toBe("RepositoryAttributeDVO");
        expect(resultItem2.content["@type"]).toBe("IdentityAttribute");
        expect(resultItem2.content.value["@type"]).toBe("Surname");
        expect((resultItem2.content.value as any).value).toBe("Weigl");

        const givenNameRepositoryResult = await consumptionServices2.attributes.getAttributes({
            query: { shareInfo: "!", content: { value: { "@type": "GivenName" } } }
        });
        expect(givenNameRepositoryResult.value).toHaveLength(1);

        const acceptResult = await consumptionServices2.incomingRequests.accept({
            requestId: dvo.request.id,
            items: [
                { accept: true, attributeId: resultItem.id } as AcceptProposeAttributeRequestItemParametersJSON,
                { accept: true, attribute: requestItemDVO.attribute.content } as AcceptProposeAttributeRequestItemParametersJSON
            ]
        });
        expect(acceptResult).toBeSuccessful();

        const givenNameRepositoryResult2 = await consumptionServices2.attributes.getAttributes({
            query: { shareInfo: "!", content: { value: { "@type": "GivenName" } } }
        });
        expect(givenNameRepositoryResult2.value).toHaveLength(1);
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
        expect(dvo.request.content.items).toHaveLength(2);
        expect(dvo.request.isDecidable).toBe(false);
        const requestItemDVO = dvo.request.content.items[0] as ProposeAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("ProposeAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(false);
        expect(requestItemDVO.query).toBeDefined();
        expect(requestItemDVO.query.type).toBe("IdentityAttributeQueryDVO");
        expect((requestItemDVO.query as any).results).toBeUndefined();
        // expect(requestItemDVO.query.renderHints.dataType).toBe("String");
        expect(requestItemDVO.query.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.query.valueHints.max).toBe(200);
        expect(requestItemDVO.mustBeAccepted).toBe(true);

        expect(requestItemDVO.attribute).toBeDefined();
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        const value = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("GivenName");
        expect(value.value).toBe("Theodor");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(true);
        expect(requestItemDVO.attribute.isOwn).toBe(true);

        const response = dvo.request.response;
        expect(response).toBeDefined();
        expect(response!.type).toBe("LocalResponseDVO");
        expect(response!.name).toBe("i18n://dvo.localResponse.name");
        expect(response!.date).toBeDefined();
        expect(response!.content.result).toBe("Accepted");
        expect(response!.content.items).toHaveLength(2);
        const responseItem = response!.content.items[0] as ProposeAttributeAcceptResponseItemJSON;
        expect(responseItem.result).toBe("Accepted");
        expect(responseItem["@type"]).toBe("ProposeAttributeAcceptResponseItem");
        expect(responseItem.attribute).toBeDefined();
        const recipientAddress = (await transportServices2.account.getIdentityInfo()).value.address;
        expect(responseItem.attribute.owner).toBe(recipientAddress);
        expect(responseItem.attribute["@type"]).toBe("IdentityAttribute");
        expect(responseItem.attribute.value["@type"]).toBe("GivenName");
        expect((responseItem.attribute.value as any).value).toBe("Marlene");

        const givenNameRepositoryResult = await consumptionServices2.attributes.getAttributes({
            query: { shareInfo: "!", content: { value: { "@type": "GivenName" } } }
        });
        expect(givenNameRepositoryResult.value).toHaveLength(1);

        const surnameRepositoryResult = await consumptionServices2.attributes.getAttributes({ query: { shareInfo: "!", content: { value: { "@type": "Surname" } } } });
        expect(surnameRepositoryResult.value).toHaveLength(2);

        const givenNameShareResult = await consumptionServices2.attributes.getValidAttributes({
            query: { content: { value: { "@type": "GivenName" } }, shareInfo: { peer: dvo.createdBy.id } }
        });
        expect(givenNameShareResult).toBeSuccessful();
        expect(givenNameShareResult.value).toHaveLength(1);
        expect((givenNameShareResult.value[0].content.value as any).value).toBe("Marlene");
        expect(responseItem.attributeId).toStrictEqual(givenNameShareResult.value[0].id);

        const responseItem2 = response!.content.items[1] as ProposeAttributeAcceptResponseItemJSON;
        expect(responseItem2.result).toBe("Accepted");
        expect(responseItem2["@type"]).toBe("ProposeAttributeAcceptResponseItem");
        expect(responseItem2.attribute).toBeDefined();

        const surnameShareResult = await consumptionServices2.attributes.getValidAttributes({
            query: { content: { value: { "@type": "Surname" } }, shareInfo: { peer: dvo.createdBy.id } }
        });
        expect(surnameShareResult).toBeSuccessful();
        expect(surnameShareResult.value).toHaveLength(1);
        expect(surnameShareResult.value[0].id).toBeDefined();
        expect((surnameShareResult.value[0].content.value as any).value).toBe("Weigl-Rostock");

        expect(responseItem2.attributeId).toStrictEqual(surnameShareResult.value[0].id);
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
        expect(dvo.request.content.items).toHaveLength(2);
        expect(dvo.request.isDecidable).toBe(false);
        const requestItemDVO = dvo.request.content.items[0] as ProposeAttributeRequestItemDVO;
        expect(requestItemDVO.type).toBe("ProposeAttributeRequestItemDVO");
        expect(requestItemDVO.isDecidable).toBe(false);
        expect(requestItemDVO.query).toBeDefined();
        expect(requestItemDVO.query.type).toBe("IdentityAttributeQueryDVO");
        expect((requestItemDVO.query as any).results).toBeUndefined();
        // expect(requestItemDVO.query.renderHints.dataType).toBe("String");
        expect(requestItemDVO.query.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.query.valueHints.max).toBe(200);
        expect(requestItemDVO.mustBeAccepted).toBe(true);

        expect(requestItemDVO.attribute).toBeDefined();
        expect(requestItemDVO.attribute.type).toBe("DraftAttributeDVO");
        const value = requestItemDVO.attribute.value as IAbstractStringJSON;
        expect(value["@type"]).toBe("GivenName");
        expect(value.value).toBe("Theodor");
        expect(requestItemDVO.attribute.renderHints.editType).toBe("InputLike");
        expect(requestItemDVO.attribute.valueHints.max).toBe(200);
        expect(requestItemDVO.attribute.isDraft).toBe(true);
        expect(requestItemDVO.attribute.isOwn).toBe(false);

        const response = dvo.request.response;
        expect(response).toBeDefined();
        expect(response!.type).toBe("LocalResponseDVO");
        expect(response!.name).toBe("i18n://dvo.localResponse.name");
        expect(response!.date).toBeDefined();
        expect(response!.content.result).toBe("Accepted");
        expect(response!.content.items).toHaveLength(2);
        const responseItem = response!.content.items[0] as ProposeAttributeAcceptResponseItemJSON;
        expect(responseItem.result).toBe("Accepted");
        expect(responseItem["@type"]).toBe("ProposeAttributeAcceptResponseItem");
        expect(responseItem.attributeId).toBeDefined();

        const responseItem2 = response!.content.items[1] as ProposeAttributeAcceptResponseItemJSON;
        expect(responseItem2.result).toBe("Accepted");
        expect(responseItem2["@type"]).toBe("ProposeAttributeAcceptResponseItem");
        expect(responseItem2.attributeId).toBeDefined();

        const givenNameResult = await consumptionServices1.attributes.getValidAttributes({
            query: { content: { value: { "@type": "GivenName" } }, shareInfo: { peer: dvo.request.peer.id } }
        });
        expect(givenNameResult).toBeSuccessful();
        expect(givenNameResult.value[0].id).toBeDefined();
        expect((givenNameResult.value[0].content.value as any).value).toBe("Marlene");

        expect(responseItem.attributeId).toStrictEqual(givenNameResult.value[0].id);

        const surnameResult = await consumptionServices1.attributes.getValidAttributes({
            query: { content: { value: { "@type": "Surname" } }, shareInfo: { peer: dvo.request.peer.id } }
        });
        expect(surnameResult).toBeSuccessful();
        expect(surnameResult.value[0].id).toBeDefined();
        expect((surnameResult.value[0].content.value as any).value).toBe("Weigl-Rostock");

        expect(responseItem2.attributeId).toStrictEqual(surnameResult.value[0].id);
    });
});
