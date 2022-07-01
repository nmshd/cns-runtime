import { EventBus } from "@js-soft/ts-utils";
import { LocalRequestStatus } from "@nmshd/consumption";
import { IResponse, RelationshipCreationChangeRequestBody } from "@nmshd/content";
import { DateTime } from "luxon";
import {
    ConsumptionServices,
    LocalRequestDTO,
    MessageDTO,
    OutgoingRequestCreatedEvent,
    OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent,
    OutgoingRequestStatusChangedEvent,
    RelationshipChangeDTO,
    RelationshipTemplateDTO,
    TransportServices
} from "../../src";
import { IncomingRequestReceivedEvent } from "../../src/events/consumption/IncomingRequestReceivedEvent";
import { IncomingRequestStatusChangedEvent } from "../../src/events/consumption/IncomingRequestStatusChangedEvent";
import { establishRelationship, RuntimeServiceProvider, syncUntilHasMessages, syncUntilHasRelationships } from "../lib";

describe("Requests", () => {
    describe.each([
        {
            action: "Accept"
        },
        {
            action: "Reject"
        }
    ] as TestCase[])("Complete flow with Messages: $action Request", ({ action }) => {
        const actionLowerCase = action.toLowerCase() as "accept" | "reject";

        const runtimeServiceProvider = new RuntimeServiceProvider();
        let sConsumptionServices: ConsumptionServices;
        let rConsumptionServices: ConsumptionServices;
        let sTransportServices: TransportServices;
        let rTransportServices: TransportServices;
        let sEventBus: EventBus;
        let rEventBus: EventBus;

        let sLocalRequest: LocalRequestDTO;
        let sRequestMessage: MessageDTO;
        let rRequestMessage: MessageDTO;
        let rLocalRequest: LocalRequestDTO;
        let rResponseMessage: MessageDTO;
        let sResponseMessage: MessageDTO;

        beforeAll(async () => {
            const runtimeServices = await runtimeServiceProvider.launch(2);
            sConsumptionServices = runtimeServices[0].consumption;
            sTransportServices = runtimeServices[0].transport;
            sEventBus = runtimeServices[0].eventBus;
            rConsumptionServices = runtimeServices[1].consumption;
            rTransportServices = runtimeServices[1].transport;
            rEventBus = runtimeServices[1].eventBus;

            await establishRelationship(sTransportServices, rTransportServices);
        }, 30000);
        afterAll(async () => await runtimeServiceProvider.stop());

        test("sender: create an outgoing Request in status Draft", async () => {
            let triggeredEvent: OutgoingRequestCreatedEvent | undefined;
            sEventBus.subscribeOnce(OutgoingRequestCreatedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await sConsumptionServices.outgoingRequests.create({
                content: {
                    items: [
                        {
                            "@type": "TestRequestItem",
                            mustBeAccepted: false
                        }
                    ],
                    expiresAt: DateTime.now().plus({ hour: 1 }).toISO()
                },
                peer: (await rTransportServices.account.getIdentityInfo()).value.address
            });

            expect(result).toBeSuccessful();

            sLocalRequest = (await sConsumptionServices.outgoingRequests.getRequest({ id: result.value.id })).value;

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.id).toBe(sLocalRequest.id);

            expect(sLocalRequest.status).toBe(LocalRequestStatus.Draft);
            expect(sLocalRequest.content.items).toHaveLength(1);
            expect(sLocalRequest.content.items[0]["@type"]).toBe("TestRequestItem");
            expect(sLocalRequest.content.items[0].mustBeAccepted).toBe(false);
        });

        test("sender: send the outgoing Request via Message", async () => {
            const result = await sTransportServices.messages.sendMessage({
                content: sLocalRequest.content,
                recipients: [(await rTransportServices.account.getIdentityInfo()).value.address]
            });

            expect(result).toBeSuccessful();

            sRequestMessage = result.value;
        });

        test("sender: mark the outgoing Request as sent", async () => {
            let triggeredEvent: OutgoingRequestStatusChangedEvent | undefined;
            sEventBus.subscribeOnce(OutgoingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await sConsumptionServices.outgoingRequests.sent({ requestId: sLocalRequest.id, messageId: sRequestMessage.id });

            expect(result).toBeSuccessful();

            sLocalRequest = result.value;

            expect(result.value.status).toBe(LocalRequestStatus.Open);
            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.request.id).toBe(result.value.id);
        });

        test("recipient: sync the Message with the Request", async () => {
            const result = await syncUntilHasMessages(rTransportServices);

            expect(result).toHaveLength(1);

            rRequestMessage = result[0];
        });

        test("recipient: create an incoming Request from the Message content", async () => {
            let triggeredEvent: IncomingRequestReceivedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestReceivedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.received({
                receivedRequest: rRequestMessage.content,
                requestSourceId: rRequestMessage.id
            });

            expect(result).toBeSuccessful();

            rLocalRequest = (await rConsumptionServices.incomingRequests.getRequest({ id: result.value.id })).value;

            expect(rLocalRequest).toBeDefined();
            expect(rLocalRequest.status).toBe(LocalRequestStatus.Open);
            expect(rLocalRequest.id).toBe(sLocalRequest.id);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.id).toBe(result.value.id);
        });

        test("recipient: check prerequisites of incoming Request", async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.checkPrerequisites({
                requestId: rLocalRequest.id
            });

            expect(result).toBeSuccessful();

            rLocalRequest = result.value;

            expect(rLocalRequest).toBeDefined();
            expect(rLocalRequest.status).toBe(LocalRequestStatus.DecisionRequired);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(LocalRequestStatus.Open);
            expect(triggeredEvent!.data.newStatus).toBe(LocalRequestStatus.DecisionRequired);
        });

        test("recipient: require manual decision of incoming Request", async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.requireManualDecision({
                requestId: rLocalRequest.id
            });

            expect(result).toBeSuccessful();

            rLocalRequest = result.value;

            expect(rLocalRequest).toBeDefined();
            expect(rLocalRequest.status).toBe(LocalRequestStatus.ManualDecisionRequired);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(LocalRequestStatus.DecisionRequired);
            expect(triggeredEvent!.data.newStatus).toBe(LocalRequestStatus.ManualDecisionRequired);
        });

        test(`recipient: call can${action} for incoming Request`, async () => {
            const result = await rConsumptionServices.incomingRequests[`can${action}`]({
                requestId: rLocalRequest.id,
                items: [
                    {
                        accept: action === "Accept"
                    }
                ]
            });

            expect(result).toBeSuccessful();

            const resultValue = result.value;

            expect(resultValue.isSuccess).toBe(true);
            expect(resultValue.items).toHaveLength(1);
            expect(resultValue.items[0].isSuccess).toBe(true);
            expect(resultValue.items[0].items).toHaveLength(0);
        });

        test(`recipient: ${actionLowerCase} incoming Request`, async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests[actionLowerCase]({
                requestId: rLocalRequest.id,
                items: [
                    {
                        accept: action === "Accept"
                    }
                ]
            });
            expect(result).toBeSuccessful();

            rLocalRequest = result.value;

            expect(rLocalRequest).toBeDefined();
            expect(rLocalRequest.status).toBe(LocalRequestStatus.Decided);
            expect(rLocalRequest.response).toBeDefined();
            expect(rLocalRequest.response!.content).toBeDefined();

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(LocalRequestStatus.ManualDecisionRequired);
            expect(triggeredEvent!.data.newStatus).toBe(LocalRequestStatus.Decided);
        });

        test("recipient: send Response via Message", async () => {
            const result = await rTransportServices.messages.sendMessage({
                content: rLocalRequest.response!.content,
                recipients: [(await sTransportServices.account.getIdentityInfo()).value.address]
            });

            expect(result).toBeSuccessful();

            rResponseMessage = result.value;

            expect(rResponseMessage.content["@type"]).toBe("Response");
        });

        test("recipient: complete incoming Request", async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.complete({
                requestId: rLocalRequest.id,
                responseSourceId: rResponseMessage.id
            });

            expect(result).toBeSuccessful();

            rLocalRequest = result.value;

            expect(rLocalRequest).toBeDefined();
            expect(rLocalRequest.status).toBe(LocalRequestStatus.Completed);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(LocalRequestStatus.Decided);
            expect(triggeredEvent!.data.newStatus).toBe(LocalRequestStatus.Completed);
        });

        test("sender: sync Message with Response", async () => {
            const result = await syncUntilHasMessages(sTransportServices);

            expect(result).toHaveLength(1);

            sResponseMessage = result[0];
        });

        test("sender: complete the outgoing Request with Response from Message", async () => {
            let triggeredEvent: OutgoingRequestStatusChangedEvent | undefined;
            sEventBus.subscribeOnce(OutgoingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await sConsumptionServices.outgoingRequests.complete({
                messageId: sResponseMessage.id,
                receivedResponse: sResponseMessage.content
            });

            expect(result).toBeSuccessful();

            sLocalRequest = result.value;

            expect(sLocalRequest).toBeDefined();
            expect(sLocalRequest.status).toBe(LocalRequestStatus.Completed);
            expect(sLocalRequest.response).toBeDefined();
            expect(sLocalRequest.response!.content).toBeDefined();

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(LocalRequestStatus.Open);
            expect(triggeredEvent!.data.newStatus).toBe(LocalRequestStatus.Completed);
        });
    });

    describe.each([
        {
            action: "Accept"
        },
        {
            action: "Reject"
        }
    ] as TestCase[])("Complete flow with Relationship Template and Change: $action Request", ({ action }) => {
        const actionLowerCase = action.toLowerCase() as "accept" | "reject";

        const runtimeServiceProvider = new RuntimeServiceProvider();
        let sConsumptionServices: ConsumptionServices;
        let rConsumptionServices: ConsumptionServices;
        let sTransportServices: TransportServices;
        let rTransportServices: TransportServices;
        let rEventBus: EventBus;
        let sEventBus: EventBus;

        let sLocalRequest: LocalRequestDTO;
        let sRelationshipTemplate: RelationshipTemplateDTO;
        let rRelationshipTemplate: RelationshipTemplateDTO;
        let rLocalRequest: LocalRequestDTO;
        let rRelationshipChange: RelationshipChangeDTO;
        let sRelationshipChange: RelationshipChangeDTO;

        beforeAll(async () => {
            const runtimeServices = await runtimeServiceProvider.launch(2);
            sConsumptionServices = runtimeServices[0].consumption;
            sTransportServices = runtimeServices[0].transport;
            sEventBus = runtimeServices[0].eventBus;
            rConsumptionServices = runtimeServices[1].consumption;
            rTransportServices = runtimeServices[1].transport;
            rEventBus = runtimeServices[1].eventBus;
        }, 30000);
        afterAll(async () => await runtimeServiceProvider.stop());

        test("sender: create a Relationship Template with the Request", async () => {
            const result = await sTransportServices.relationshipTemplates.createOwnRelationshipTemplate({
                content: {
                    "@type": "RelationshipTemplateBody",
                    onNewRelationship: {
                        "@type": "Request",
                        items: [
                            {
                                "@type": "TestRequestItem",
                                mustBeAccepted: false
                            }
                        ],
                        expiresAt: DateTime.now().plus({ hour: 1 }).toISO()
                    }
                },
                expiresAt: DateTime.now().plus({ hour: 1 }).toISO()
            });

            expect(result).toBeSuccessful();

            sRelationshipTemplate = result.value;
        });

        test("recipient: load the Relationship Template with the Request", async () => {
            const result = await rTransportServices.relationshipTemplates.loadPeerRelationshipTemplate({ relationshipTemplateReference: sRelationshipTemplate.truncatedReference });

            expect(result).toBeSuccessful();

            rRelationshipTemplate = result.value;
        });

        test("recipient: create an incoming Request from the Relationship Template content", async () => {
            let triggeredEvent: IncomingRequestReceivedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestReceivedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.received({
                receivedRequest: rRelationshipTemplate.content.onNewRelationship,
                requestSourceId: rRelationshipTemplate.id
            });

            expect(result).toBeSuccessful();

            rLocalRequest = (await rConsumptionServices.incomingRequests.getRequest({ id: result.value.id })).value;

            expect(rLocalRequest).toBeDefined();
            expect(rLocalRequest.status).toBe(LocalRequestStatus.Open);
            expect(rLocalRequest.id).toBeDefined();

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.id).toBe(result.value.id);
        });

        test("recipient: check prerequisites of incoming Request", async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.checkPrerequisites({
                requestId: rLocalRequest.id
            });

            expect(result).toBeSuccessful();

            rLocalRequest = result.value;

            expect(rLocalRequest).toBeDefined();
            expect(rLocalRequest.status).toBe(LocalRequestStatus.DecisionRequired);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(LocalRequestStatus.Open);
            expect(triggeredEvent!.data.newStatus).toBe(LocalRequestStatus.DecisionRequired);
        });

        test("recipient: require manual decision of incoming Request", async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.requireManualDecision({
                requestId: rLocalRequest.id
            });

            expect(result).toBeSuccessful();

            rLocalRequest = result.value;

            expect(rLocalRequest).toBeDefined();
            expect(rLocalRequest.status).toBe(LocalRequestStatus.ManualDecisionRequired);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(LocalRequestStatus.DecisionRequired);
            expect(triggeredEvent!.data.newStatus).toBe(LocalRequestStatus.ManualDecisionRequired);
        });

        test(`recipient: call can${action} for incoming Request`, async () => {
            const result = await rConsumptionServices.incomingRequests[`can${action}`]({
                requestId: rLocalRequest.id,
                items: [
                    {
                        accept: action === "Accept" ? true : false // eslint-disable-line jest/no-if
                    }
                ]
            });

            expect(result).toBeSuccessful();

            const resultValue = result.value;

            expect(resultValue.isSuccess).toBe(true);
            expect(resultValue.items).toHaveLength(1);
            expect(resultValue.items[0].isSuccess).toBe(true);
            expect(resultValue.items[0].items).toHaveLength(0);
        });

        test(`recipient: ${actionLowerCase} incoming Request`, async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests[actionLowerCase]({
                requestId: rLocalRequest.id,
                items: [
                    {
                        accept: action === "Accept"
                    }
                ]
            });

            expect(result).toBeSuccessful();

            rLocalRequest = result.value;

            expect(rLocalRequest).toBeDefined();
            expect(rLocalRequest.status).toBe(LocalRequestStatus.Decided);
            expect(rLocalRequest.response).toBeDefined();
            expect(rLocalRequest.response!.content).toBeDefined();

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(LocalRequestStatus.ManualDecisionRequired);
            expect(triggeredEvent!.data.newStatus).toBe(LocalRequestStatus.Decided);
        });

        test("recipient: send Response via Relationship Creation Change", async () => {
            const creationChangeBody = RelationshipCreationChangeRequestBody.from({ response: rLocalRequest.response!.content as unknown as IResponse });
            const result = await rTransportServices.relationships.createRelationship({
                content: creationChangeBody,
                templateId: rRelationshipTemplate.id
            });

            expect(result).toBeSuccessful();

            rRelationshipChange = result.value.changes[0];

            expect(rRelationshipChange.request.content["@type"]).toBe("RelationshipCreationChangeRequestBody");
        });

        test("recipient: complete incoming Request", async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.complete({
                requestId: rLocalRequest.id,
                responseSourceId: rRelationshipChange.id
            });

            expect(result).toBeSuccessful();

            rLocalRequest = result.value;

            expect(rLocalRequest).toBeDefined();
            expect(rLocalRequest.status).toBe(LocalRequestStatus.Completed);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(LocalRequestStatus.Decided);
            expect(triggeredEvent!.data.newStatus).toBe(LocalRequestStatus.Completed);
        });

        test("sender: sync Relationship", async () => {
            const result = await syncUntilHasRelationships(sTransportServices);

            expect(result).toHaveLength(1);

            sRelationshipChange = result[0].changes[0];
        });

        test("sender: create the outgoing Request with Request from Relationship Template and Response from Relationship Creation Change", async () => {
            let triggeredEvent: OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent | undefined;
            sEventBus.subscribeOnce(OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await sConsumptionServices.outgoingRequests.createAndCompleteFromRelationshipCreationChange({
                relationshipChangeId: sRelationshipChange.id,
                templateId: sRelationshipTemplate.id
            });

            expect(result).toBeSuccessful();

            sLocalRequest = sLocalRequest = (await sConsumptionServices.outgoingRequests.getRequest({ id: result.value.id })).value;

            expect(sLocalRequest).toBeDefined();
            expect(sLocalRequest.id).toBe(rLocalRequest.id);
            expect(sLocalRequest.status).toBe(LocalRequestStatus.Completed);
            expect(sLocalRequest.response).toBeDefined();
            expect(sLocalRequest.response!.content).toBeDefined();

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
        });
    });
});

interface TestCase {
    action: "Accept" | "Reject";
}
