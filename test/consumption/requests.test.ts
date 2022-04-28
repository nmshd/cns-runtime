/* eslint-disable jest/no-commented-out-tests */
import { EventBus } from "@js-soft/ts-utils";
import { ConsumptionRequestStatus, RequestItemDecision } from "@nmshd/consumption";
import { ConsumptionRequestDTO, ConsumptionServices, MessageDTO, OutgoingRequestStatusChangedEvent, RequestCreatedEvent, RequestSentEvent, TransportServices } from "../../src";
import { IncomingRequestStatusChangedEvent } from "../../src/events/consumption/IncomingRequestStatusChangedEvent";
import { RequestReceivedEvent } from "../../src/events/consumption/RequestReceivedEvent";
import { establishRelationship, RuntimeServiceProvider, syncUntilHasMessages } from "../lib";

describe("Requests", () => {
    describe("Complete flow with Messages", () => {
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
            let triggeredEvent: RequestCreatedEvent | undefined;
            sEventBus.subscribeOnce(RequestCreatedEvent, (event) => {
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
                    expiresAt: "2022-01-01T00:00:00.000Z"
                },
                peer: "id1"
            });

            expect(result.isSuccess).toBe(true);

            sConsumptionRequest = result.value;

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.id).toBe(sConsumptionRequest.id);

            expect(sConsumptionRequest.status).toBe(ConsumptionRequestStatus.Draft);
            expect(sConsumptionRequest.content.expiresAt).toBe("2022-01-01T00:00:00.000Z");
            expect(sConsumptionRequest.content.items).toHaveLength(1);
            expect(sConsumptionRequest.content.items[0]["@type"]).toBe("TestRequestItem");
            expect(sConsumptionRequest.content.items[0].mustBeAccepted).toBe(false);
        });

        test("sender: send the outgoing Request via Message", async () => {
            const result = await sTransportServices.messages.sendMessage({
                content: sConsumptionRequest.content,
                recipients: [(await rTransportServices.account.getIdentityInfo()).value.address]
            });

            expect(result.isSuccess).toBe(true);

            sRequestMessage = result.value;
        });

        test("sender: mark the outgoing Request as sent", async () => {
            let triggeredEvent: RequestSentEvent | undefined;
            sEventBus.subscribeOnce(RequestSentEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await sConsumptionServices.outgoingRequests.sent({ requestId: sConsumptionRequest.id, messageId: sRequestMessage.id });

            expect(result.isSuccess).toBe(true);

            sConsumptionRequest = result.value;

            expect(result.value.status).toBe(ConsumptionRequestStatus.Open);
            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.id).toBe(result.value.id);
        });

        test("sender: sync the Message with the Request", async () => {
            const result = await syncUntilHasMessages(rTransportServices);

            expect(result).toHaveLength(1);

            rRequestMessage = result[0];
        });

        test("recipient: create an incoming Request from the Message content", async () => {
            let triggeredEvent: RequestReceivedEvent | undefined;
            rEventBus.subscribeOnce(RequestReceivedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.received({
                receivedRequest: rRequestMessage.content,
                requestSourceId: rRequestMessage.id
            });

            expect(result.isSuccess).toBe(true);

            rConsumptionRequest = result.value;

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

            expect(result.isSuccess).toBe(true);

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

            expect(result.isSuccess).toBe(true);

            rConsumptionRequest = result.value;

            expect(rConsumptionRequest).toBeDefined();
            expect(rConsumptionRequest.status).toBe(ConsumptionRequestStatus.ManualDecisionRequired);

            expect(triggeredEvent).toBeDefined();
            expect(triggeredEvent!.data).toBeDefined();
            expect(triggeredEvent!.data.oldStatus).toBe(ConsumptionRequestStatus.DecisionRequired);
            expect(triggeredEvent!.data.newStatus).toBe(ConsumptionRequestStatus.ManualDecisionRequired);
        });

        test("recipient: call canAccept of incoming Request", async () => {
            const result = await rConsumptionServices.incomingRequests.canAccept({
                requestId: rConsumptionRequest.id,
                items: [
                    {
                        decision: RequestItemDecision.Accept
                    }
                ]
            });

            expect(result.isSuccess).toBe(true);

            const canAcceptResult = result.value;

            expect(canAcceptResult.isSuccess).toBe(true);
            expect(canAcceptResult.items).toHaveLength(1);
            expect(canAcceptResult.items[0].isSuccess).toBe(true);
            expect(canAcceptResult.items[0].items).toHaveLength(0);
        });

        test("recipient: accept incoming Request", async () => {
            let triggeredEvent: IncomingRequestStatusChangedEvent | undefined;
            rEventBus.subscribeOnce(IncomingRequestStatusChangedEvent, (event) => {
                triggeredEvent = event;
            });

            const result = await rConsumptionServices.incomingRequests.accept({
                requestId: rConsumptionRequest.id,
                items: [
                    {
                        decision: RequestItemDecision.Accept
                    }
                ]
            });

            expect(result.isSuccess).toBe(true);

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

            expect(result.isSuccess).toBe(true);

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

            expect(result.isSuccess).toBe(true);

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

            expect(result.isSuccess).toBe(true);

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
});
