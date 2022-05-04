import { EventBus } from "@js-soft/ts-utils";
import { ConsumptionRequestStatus } from "@nmshd/consumption";
import { DateTime } from "luxon";
import {
    ConsumptionRequestDTO,
    ConsumptionServices,
    MessageDTO,
    OutgoingRequestCreatedEvent,
    OutgoingRequestStatusChangedEvent,
    RelationshipChangeDTO,
    RelationshipTemplateDTO,
    RequestSentEvent,
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
    ] as TestCase[])("Complete flow with Messages: $type Request", ({ action }) => {
        const actionLowerCase = action.toLowerCase() as "accept" | "reject";

        const runtimeServiceProvider = new RuntimeServiceProvider();
        let sConsumptionServices: ConsumptionServices;
        let rConsumptionServices: ConsumptionServices;
        let sTransportServices: TransportServices;
        let rTransportServices: TransportServices;
        let sEventBus: EventBus;
        let rEventBus: EventBus;

        let sConsumptionRequest: ConsumptionRequestDTO;
        let sRequestMessage: MessageDTO;
        let rRequestMessage: MessageDTO;
        let rConsumptionRequest: ConsumptionRequestDTO;
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

            sConsumptionRequest = (await sConsumptionServices.outgoingRequests.getRequest({ id: result.value.id })).value;

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.id).toBe(sConsumptionRequest.id);

            expect(sConsumptionRequest.status).toBe(ConsumptionRequestStatus.Draft);
            expect(sConsumptionRequest.content.items).toHaveLength(1);
            expect(sConsumptionRequest.content.items[0]["@type"]).toBe("TestRequestItem");
            expect(sConsumptionRequest.content.items[0].mustBeAccepted).toBe(false);
        });

        test("sender: send the outgoing Request via Message", async () => {
            const result = await sTransportServices.messages.sendMessage({
                content: sConsumptionRequest.content,
                recipients: [(await rTransportServices.account.getIdentityInfo()).value.address]
            });

            expect(result).toBeSuccessful();

            sRequestMessage = result.value;
        });

        test("sender: mark the outgoing Request as sent", async () => {
            let triggeredEvent: RequestSentEvent | undefined;
            sEventBus.subscribeOnce(RequestSentEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await sConsumptionServices.outgoingRequests.sent({ requestId: sConsumptionRequest.id, messageId: sRequestMessage.id });

            expect(result).toBeSuccessful();

            sConsumptionRequest = result.value;

            expect(result.value.status).toBe(ConsumptionRequestStatus.Open);
            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.id).toBe(result.value.id);
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

            rConsumptionRequest = (await rConsumptionServices.incomingRequests.getRequest({ id: result.value.id })).value;

            expect(rConsumptionRequest).toBeDefined();
            expect(rConsumptionRequest.status).toBe(ConsumptionRequestStatus.Open);
            expect(rConsumptionRequest.id).toBe(sConsumptionRequest.id);

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
                requestId: rConsumptionRequest.id
            });

            expect(result).toBeSuccessful();

            rConsumptionRequest = result.value;

            expect(rConsumptionRequest).toBeDefined();
            expect(rConsumptionRequest.status).toBe(ConsumptionRequestStatus.DecisionRequired);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(ConsumptionRequestStatus.Open);
            expect(triggeredEvent!.data.newStatus).toBe(ConsumptionRequestStatus.DecisionRequired);
        });

        test("recipient: require manual decision of incoming Request", async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.requireManualDecision({
                requestId: rConsumptionRequest.id
            });

            expect(result).toBeSuccessful();

            rConsumptionRequest = result.value;

            expect(rConsumptionRequest).toBeDefined();
            expect(rConsumptionRequest.status).toBe(ConsumptionRequestStatus.ManualDecisionRequired);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(ConsumptionRequestStatus.DecisionRequired);
            expect(triggeredEvent!.data.newStatus).toBe(ConsumptionRequestStatus.ManualDecisionRequired);
        });

        test(`recipient: call can${action} for incoming Request`, async () => {
            const result = await rConsumptionServices.incomingRequests[`can${action}`]({
                requestId: rConsumptionRequest.id,
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
                requestId: rConsumptionRequest.id,
                items: [
                    {
                        accept: action === "Accept"
                    }
                ]
            });
            expect(result).toBeSuccessful();

            rConsumptionRequest = result.value;

            expect(rConsumptionRequest).toBeDefined();
            expect(rConsumptionRequest.status).toBe(ConsumptionRequestStatus.Decided);
            expect(rConsumptionRequest.response).toBeDefined();
            expect(rConsumptionRequest.response!.content).toBeDefined();

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(ConsumptionRequestStatus.ManualDecisionRequired);
            expect(triggeredEvent!.data.newStatus).toBe(ConsumptionRequestStatus.Decided);
        });

        test("recipient: send Response via Message", async () => {
            const result = await rTransportServices.messages.sendMessage({
                content: rConsumptionRequest.response!.content,
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
                requestId: rConsumptionRequest.id,
                responseSourceId: rResponseMessage.id
            });

            expect(result).toBeSuccessful();

            rConsumptionRequest = result.value;

            expect(rConsumptionRequest).toBeDefined();
            expect(rConsumptionRequest.status).toBe(ConsumptionRequestStatus.Completed);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(ConsumptionRequestStatus.Decided);
            expect(triggeredEvent!.data.newStatus).toBe(ConsumptionRequestStatus.Completed);
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
                requestId: sConsumptionRequest.id,
                messageId: sResponseMessage.id,
                receivedResponse: sResponseMessage.content
            });

            expect(result).toBeSuccessful();

            sConsumptionRequest = result.value;

            expect(sConsumptionRequest).toBeDefined();
            expect(sConsumptionRequest.status).toBe(ConsumptionRequestStatus.Completed);
            expect(sConsumptionRequest.response).toBeDefined();
            expect(sConsumptionRequest.response!.content).toBeDefined();

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(ConsumptionRequestStatus.Open);
            expect(triggeredEvent!.data.newStatus).toBe(ConsumptionRequestStatus.Completed);
        });
    });

    describe.each([
        {
            action: "Accept"
        },
        {
            action: "Reject"
        }
    ] as TestCase[])("Complete flow with Relationship Template and Change: $type Request", ({ action }) => {
        const actionLowerCase = action.toLowerCase() as "accept" | "reject";

        const runtimeServiceProvider = new RuntimeServiceProvider();
        let sConsumptionServices: ConsumptionServices;
        let rConsumptionServices: ConsumptionServices;
        let sTransportServices: TransportServices;
        let rTransportServices: TransportServices;
        let rEventBus: EventBus;

        let sConsumptionRequest: ConsumptionRequestDTO;
        let sRelationshipTemplate: RelationshipTemplateDTO;
        let rRelationshipTemplate: RelationshipTemplateDTO;
        let rConsumptionRequest: ConsumptionRequestDTO;
        let rRelationshipChange: RelationshipChangeDTO;
        let sRelationshipChange: RelationshipChangeDTO;

        beforeAll(async () => {
            const runtimeServices = await runtimeServiceProvider.launch(2);
            sConsumptionServices = runtimeServices[0].consumption;
            sTransportServices = runtimeServices[0].transport;
            rConsumptionServices = runtimeServices[1].consumption;
            rTransportServices = runtimeServices[1].transport;
            rEventBus = runtimeServices[1].eventBus;
        }, 30000);
        afterAll(async () => await runtimeServiceProvider.stop());

        test("sender: create a Relationship Template with the Request", async () => {
            const result = await sTransportServices.relationshipTemplates.createOwnRelationshipTemplate({
                content: {
                    "@type": "Request",
                    items: [
                        {
                            "@type": "TestRequestItem",
                            mustBeAccepted: false
                        }
                    ],
                    expiresAt: DateTime.now().plus({ hour: 1 }).toISO()
                },
                expiresAt: DateTime.now().plus({ hour: 1 }).toISO()
            });

            expect(result).toBeSuccessful();

            sRelationshipTemplate = result.value;
        });

        test("recipient: load the Relationship Template with the Request", async () => {
            const tokenResult = await sTransportServices.relationshipTemplates.createTokenForOwnTemplate({ templateId: sRelationshipTemplate.id });

            const result = await rTransportServices.relationshipTemplates.loadPeerRelationshipTemplate({ reference: tokenResult.value.truncatedReference });

            expect(result).toBeSuccessful();

            rRelationshipTemplate = result.value;
        });

        test("recipient: create an incoming Request from the Relationship Template content", async () => {
            let triggeredEvent: IncomingRequestReceivedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestReceivedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.received({
                receivedRequest: rRelationshipTemplate.content,
                requestSourceId: rRelationshipTemplate.id
            });

            expect(result).toBeSuccessful();

            rConsumptionRequest = (await rConsumptionServices.incomingRequests.getRequest({ id: result.value.id })).value;

            expect(rConsumptionRequest).toBeDefined();
            expect(rConsumptionRequest.status).toBe(ConsumptionRequestStatus.Open);
            expect(rConsumptionRequest.id).toBeDefined();

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
                requestId: rConsumptionRequest.id
            });

            expect(result).toBeSuccessful();

            rConsumptionRequest = result.value;

            expect(rConsumptionRequest).toBeDefined();
            expect(rConsumptionRequest.status).toBe(ConsumptionRequestStatus.DecisionRequired);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(ConsumptionRequestStatus.Open);
            expect(triggeredEvent!.data.newStatus).toBe(ConsumptionRequestStatus.DecisionRequired);
        });

        test("recipient: require manual decision of incoming Request", async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.requireManualDecision({
                requestId: rConsumptionRequest.id
            });

            expect(result).toBeSuccessful();

            rConsumptionRequest = result.value;

            expect(rConsumptionRequest).toBeDefined();
            expect(rConsumptionRequest.status).toBe(ConsumptionRequestStatus.ManualDecisionRequired);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(ConsumptionRequestStatus.DecisionRequired);
            expect(triggeredEvent!.data.newStatus).toBe(ConsumptionRequestStatus.ManualDecisionRequired);
        });

        test(`recipient: call can${action} for incoming Request`, async () => {
            const result = await rConsumptionServices.incomingRequests[`can${action}`]({
                requestId: rConsumptionRequest.id,
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
                requestId: rConsumptionRequest.id,
                items: [
                    {
                        accept: action === "Accept"
                    }
                ]
            });

            expect(result).toBeSuccessful();

            rConsumptionRequest = result.value;

            expect(rConsumptionRequest).toBeDefined();
            expect(rConsumptionRequest.status).toBe(ConsumptionRequestStatus.Decided);
            expect(rConsumptionRequest.response).toBeDefined();
            expect(rConsumptionRequest.response!.content).toBeDefined();

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(ConsumptionRequestStatus.ManualDecisionRequired);
            expect(triggeredEvent!.data.newStatus).toBe(ConsumptionRequestStatus.Decided);
        });

        test("recipient: send Response via Message", async () => {
            const result = await rTransportServices.relationships.createRelationship({
                content: rConsumptionRequest.response!.content,
                templateId: rRelationshipTemplate.id
            });

            expect(result).toBeSuccessful();

            rRelationshipChange = result.value.changes[0];

            expect(rRelationshipChange.request.content["@type"]).toBe("Response");
        });

        test("recipient: complete incoming Request", async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.complete({
                requestId: rConsumptionRequest.id,
                responseSourceId: rRelationshipChange.id
            });

            expect(result).toBeSuccessful();

            rConsumptionRequest = result.value;

            expect(rConsumptionRequest).toBeDefined();
            expect(rConsumptionRequest.status).toBe(ConsumptionRequestStatus.Completed);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(ConsumptionRequestStatus.Decided);
            expect(triggeredEvent!.data.newStatus).toBe(ConsumptionRequestStatus.Completed);
        });

        test("sender: sync Relationship", async () => {
            const result = await syncUntilHasRelationships(sTransportServices);

            expect(result).toHaveLength(1);

            sRelationshipChange = result[0].changes[0];
        });

        test("sender: create the outgoing Request with Request from Relationship Template and Response from Relationship Creation Change", async () => {
            const result = await sConsumptionServices.outgoingRequests.createFromRelationshipCreationChange({
                relationshipChangeId: sRelationshipChange.id,
                templateId: sRelationshipTemplate.id
            });

            expect(result).toBeSuccessful();

            sConsumptionRequest = sConsumptionRequest = (await sConsumptionServices.outgoingRequests.getRequest({ id: result.value.id })).value;

            expect(sConsumptionRequest).toBeDefined();
            expect(sConsumptionRequest.id).toBe(rConsumptionRequest.id);
            expect(sConsumptionRequest.status).toBe(ConsumptionRequestStatus.Completed);
            expect(sConsumptionRequest.response).toBeDefined();
            expect(sConsumptionRequest.response!.content).toBeDefined();
        });
    });
});

interface TestCase {
    action: "Accept" | "Reject";
}
