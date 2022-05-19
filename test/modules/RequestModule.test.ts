import { EventBus } from "@js-soft/ts-utils";
import { ConsumptionRequestStatus } from "@nmshd/consumption";
import { RelationshipCreationChangeRequestBodyJSON, RelationshipTemplateBodyJSON, ResponseItemJSON, ResponseItemResult } from "@nmshd/content";
import {
    ConsumptionServices,
    IncomingRequestReceivedEvent,
    IncomingRequestStatusChangedEvent,
    OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent,
    RelationshipStatus,
    TransportServices
} from "../../src";
import { exchangeTemplate, RuntimeServiceProvider, syncUntilHasRelationships, waitForEvent } from "../lib";

const runtimeServiceProvider = new RuntimeServiceProvider();
let sTransportServices: TransportServices;
let sConsumptionServices: ConsumptionServices;
let sEventBus: EventBus;

let rTransportServices: TransportServices;
let rConsumptionServices: ConsumptionServices;
let rEventBus: EventBus;

let requestId: string;

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
    const metadata = { aMetadataKey: "aMetadataValue" };

    test("creates a request for a loaded peer relationship template and checks its prerequisites", async () => {
        const waitForIncomingRequestReceived = waitForEvent(rEventBus, IncomingRequestReceivedEvent, 4000);
        const waitForIncomingRequestDecisionRequired = waitForEvent(
            rEventBus,
            IncomingRequestStatusChangedEvent,
            4000,
            (event) => event.data.newStatus === ConsumptionRequestStatus.DecisionRequired
        );

        const templateBody: RelationshipTemplateBodyJSON = {
            "@type": "RelationshipTemplateBody",
            onNewRelationship: { "@type": "Request", items: [{ "@type": "TestRequestItem", mustBeAccepted: false }] },
            metadata
        };

        await exchangeTemplate(sTransportServices, rTransportServices, templateBody);

        const waitedForIncomingRequestReceived = await waitForIncomingRequestReceived;
        expect(waitedForIncomingRequestReceived.data.status).toBe(ConsumptionRequestStatus.Open);

        const waitedForIncomingRequestDecisionRequired = await waitForIncomingRequestDecisionRequired;
        expect(waitedForIncomingRequestDecisionRequired.data.newStatus).toBe(ConsumptionRequestStatus.DecisionRequired);

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
            (event) => event.data.newStatus === ConsumptionRequestStatus.Completed
        );

        const acceptRequestResult = await rConsumptionServices.incomingRequests.accept({ requestId, items: [{ accept: true }] });
        expect(acceptRequestResult).toBeSuccessful();

        const waitedForIncomingRequestCompleted = await waitForIncomingRequestCompleted;
        expect(waitedForIncomingRequestCompleted.data.newStatus).toBe(ConsumptionRequestStatus.Completed);

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