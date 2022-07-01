import { EventBus } from "@js-soft/ts-utils";
import { LocalRequestStatus } from "@nmshd/consumption";
import { RelationshipCreationChangeRequestBodyJSON, RelationshipTemplateBodyJSON, ResponseItemJSON, ResponseItemResult } from "@nmshd/content";
import {
    ConsumptionServices,
    IncomingRequestReceivedEvent,
    IncomingRequestStatusChangedEvent,
    MessageSentEvent,
    OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent,
    OutgoingRequestStatusChangedEvent,
    RelationshipStatus,
    TransportServices
} from "../../src";
import { establishRelationship, exchangeTemplate, RuntimeServiceProvider, sendMessage, syncUntilHasMessages, syncUntilHasRelationships, waitForEvent } from "../lib";

const runtimeServiceProvider = new RuntimeServiceProvider();
let sTransportServices: TransportServices;
let sConsumptionServices: ConsumptionServices;
let sEventBus: EventBus;

let rTransportServices: TransportServices;
let rConsumptionServices: ConsumptionServices;
let rEventBus: EventBus;

beforeAll(async () => {
    const runtimeServices = await runtimeServiceProvider.launch(2, { enableRequestModule: true });
    sTransportServices = runtimeServices[1].transport;
    sConsumptionServices = runtimeServices[1].consumption;
    sEventBus = runtimeServices[1].eventBus;

    rTransportServices = runtimeServices[0].transport;
    rConsumptionServices = runtimeServices[0].consumption;
    rEventBus = runtimeServices[0].eventBus;
}, 30000);
afterAll(async () => await runtimeServiceProvider.stop());

describe("RequestModule", () => {
    describe("Relationships", () => {
        const metadata = { aMetadataKey: "aMetadataValue" };
        let requestId: string;

        test("creates a request for a loaded peer relationship template and checks its prerequisites", async () => {
            const waitForIncomingRequestReceived = waitForEvent(rEventBus, IncomingRequestReceivedEvent, 4000);
            const waitForIncomingRequestDecisionRequired = waitForEvent(
                rEventBus,
                IncomingRequestStatusChangedEvent,
                4000,
                (event) => event.data.newStatus === LocalRequestStatus.DecisionRequired
            );

            const templateBody: RelationshipTemplateBodyJSON = {
                "@type": "RelationshipTemplateBody",
                onNewRelationship: { "@type": "Request", items: [{ "@type": "TestRequestItem", mustBeAccepted: false }] },
                metadata
            };

            await exchangeTemplate(sTransportServices, rTransportServices, templateBody);

            const waitedForIncomingRequestReceived = await waitForIncomingRequestReceived;
            expect(waitedForIncomingRequestReceived.data.status).toBe(LocalRequestStatus.Open);

            const waitedForIncomingRequestDecisionRequired = await waitForIncomingRequestDecisionRequired;
            expect(waitedForIncomingRequestDecisionRequired.data.newStatus).toBe(LocalRequestStatus.DecisionRequired);

            const requestsResult = await rConsumptionServices.incomingRequests.getRequests({});
            expect(requestsResult).toBeSuccessful();
            expect(requestsResult.value).toHaveLength(1);

            requestId = requestsResult.value[0].id;
        });

        test("creates the relationship when the request is accepted", async () => {
            const waitForIncomingRequestCompleted = waitForEvent(
                rEventBus,
                IncomingRequestStatusChangedEvent,
                5000,
                (event) => event.data.newStatus === LocalRequestStatus.Completed
            );

            const acceptRequestResult = await rConsumptionServices.incomingRequests.accept({ requestId, items: [{ accept: true }] });
            expect(acceptRequestResult).toBeSuccessful();

            const waitedForIncomingRequestCompleted = await waitForIncomingRequestCompleted;
            expect(waitedForIncomingRequestCompleted.data.newStatus).toBe(LocalRequestStatus.Completed);

            const getRelationshipsResult = await rTransportServices.relationships.getRelationships({});
            expect(getRelationshipsResult).toBeSuccessful();

            expect(getRelationshipsResult.value).toHaveLength(1);
            expect(getRelationshipsResult.value[0].status).toBe(RelationshipStatus.Pending);
        });

        test("the relationship with the correct data is created", async () => {
            const waitForOutgoingRequestCreatedAndCompleted = waitForEvent(sEventBus, OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent, 5000);

            const relationships = await syncUntilHasRelationships(sTransportServices, 1);
            expect(relationships).toHaveLength(1);

            const relationship = relationships[0];

            const creationChangeRequestContent = relationship.changes[0].request.content as RelationshipCreationChangeRequestBodyJSON;
            expect(creationChangeRequestContent["@type"]).toBe("RelationshipCreationChangeRequestBody");

            expect(creationChangeRequestContent.templateContentMetadata).toStrictEqual(metadata);

            const response = creationChangeRequestContent.response;
            const responseItems = response.items;
            expect(responseItems).toHaveLength(1);

            const responseItem = responseItems[0] as ResponseItemJSON;
            expect(responseItem["@type"]).toBe("AcceptResponseItem");
            expect(responseItem.result).toBe(ResponseItemResult.Accepted);

            const waitedForOutgoingRequestCreatedAndCompleted = await waitForOutgoingRequestCreatedAndCompleted;
            const request = waitedForOutgoingRequestCreatedAndCompleted.data;

            expect(request.id).toBe(response.requestId);

            const requestsResult = await sConsumptionServices.outgoingRequests.getRequest({ id: response.requestId });
            expect(requestsResult).toBeSuccessful();
        });
    });

    describe("Messages", () => {
        let recipientAddress: string;
        let requestId: string;

        beforeAll(async () => {
            const relationships = (await sTransportServices.relationships.getRelationships({})).value;
            if (relationships.length === 0) {
                await establishRelationship(sTransportServices, rTransportServices);
            } else if (relationships[0].status === RelationshipStatus.Pending) {
                const relationship = relationships[0];
                await sTransportServices.relationships.acceptRelationshipChange({ relationshipId: relationship.id, changeId: relationship.changes[0].id, content: {} });
                await rTransportServices.account.syncEverything();
            }

            recipientAddress = (await sTransportServices.relationships.getRelationships({})).value[0].peer;
        });

        test("sending the request moves the request status to open", async () => {
            const createRequestResult = await sConsumptionServices.outgoingRequests.create({
                content: { items: [{ "@type": "TestRequestItem", mustBeAccepted: false }] },
                peer: recipientAddress
            });

            requestId = createRequestResult.value.id;

            const waitForOutgoingRequestOpen = waitForEvent(sEventBus, OutgoingRequestStatusChangedEvent, 4000, (event) => event.data.newStatus === LocalRequestStatus.Open);

            await sendMessage(sTransportServices, recipientAddress, createRequestResult.value.content);

            const waitedForOutgoingRequestOpen = await waitForOutgoingRequestOpen;
            expect(waitedForOutgoingRequestOpen.data.newStatus).toBe(LocalRequestStatus.Open);
        });

        test("the incoming request should be created and moved to status DecisionRequired", async () => {
            const waitForIncomingRequestReceived = waitForEvent(rEventBus, IncomingRequestReceivedEvent, 5000);
            const waitForIncomingRequestDecisionRequired = waitForEvent(
                rEventBus,
                IncomingRequestStatusChangedEvent,
                4000,
                (event) => event.data.newStatus === LocalRequestStatus.DecisionRequired
            );

            const messages = await syncUntilHasMessages(rTransportServices, 1);
            expect(messages).toHaveLength(1);

            const waitedForIncomingRequestReceived = await waitForIncomingRequestReceived;
            const request = waitedForIncomingRequestReceived.data;
            expect(request.id).toBe(requestId);

            const waitedForIncomingRequestDecisionRequired = await waitForIncomingRequestDecisionRequired;
            expect(waitedForIncomingRequestDecisionRequired.data.newStatus).toBe(LocalRequestStatus.DecisionRequired);

            const requestsResult = await rConsumptionServices.incomingRequests.getRequest({ id: requestId });
            expect(requestsResult).toBeSuccessful();
        });

        test("should send a message when the request is accepted", async () => {
            const waitForIncomingRequestCompleted = waitForEvent(
                rEventBus,
                IncomingRequestStatusChangedEvent,
                5000,
                (event) => event.data.newStatus === LocalRequestStatus.Completed
            );
            const waitForMessageSent = waitForEvent(rEventBus, MessageSentEvent, 5000);

            const acceptRequestResult = await rConsumptionServices.incomingRequests.accept({ requestId, items: [{ accept: true }] });
            expect(acceptRequestResult).toBeSuccessful();

            const waitedForIncomingRequestCompleted = await waitForIncomingRequestCompleted;
            expect(waitedForIncomingRequestCompleted.data.newStatus).toBe(LocalRequestStatus.Completed);

            const waitedForMessageSent = await waitForMessageSent;
            expect(waitedForMessageSent.data.content["@type"]).toBe("Response");
        });

        test("the request module of the sender should process the response", async () => {
            const waitForRequestStatusChanged = waitForEvent(sEventBus, OutgoingRequestStatusChangedEvent, 5000, (event) => event.data.newStatus === LocalRequestStatus.Completed);

            const messages = await syncUntilHasMessages(sTransportServices, 1);
            expect(messages).toHaveLength(1);

            const waitedForRequestStatusChanged = await waitForRequestStatusChanged;
            expect(waitedForRequestStatusChanged.data.newStatus).toBe(LocalRequestStatus.Completed);
        });
    });
});
