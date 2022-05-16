import { EventBus } from "@js-soft/ts-utils";
import { ConsumptionRequestStatus } from "@nmshd/consumption";
import { ConsumptionServices, IncomingRequestStatusChangedEvent } from "../../src";
import { establishRelationship, exchangeMessage, RuntimeServiceProvider, waitForEvent } from "../lib";

const runtimeServiceProvider = new RuntimeServiceProvider();
let rConsumptionServices: ConsumptionServices;
let rEventBus: EventBus;
let messageId: string;

beforeAll(async () => {
    const runtimeServices = await runtimeServiceProvider.launch(2, { modules: { deciderModule: true } });
    rConsumptionServices = runtimeServices[0].consumption;
    rEventBus = runtimeServices[0].eventBus;

    const sTransportServices = runtimeServices[1].transport;
    const rTransportServices = runtimeServices[0].transport;

    await establishRelationship(sTransportServices, rTransportServices);
    messageId = (await exchangeMessage(sTransportServices, rTransportServices)).id;
}, 30000);
afterAll(async () => await runtimeServiceProvider.stop());

describe("DeciderModule", () => {
    test("moves incoming Requests into status 'ManualDecisionRequired' after they reach status 'Open'", async () => {
        const receivedRequestResult = await rConsumptionServices.incomingRequests.received({
            receivedRequest: { "@type": "Request", items: [{ "@type": "TestRequestItem", mustBeAccepted: false }] },
            requestSourceId: messageId
        });
        expect(receivedRequestResult).toBeSuccessful();

        const eventPromise = waitForEvent(
            rEventBus,
            IncomingRequestStatusChangedEvent,
            4000,
            (event) => event.data.newStatus === ConsumptionRequestStatus.DecisionRequired && event.data.request.id === receivedRequestResult.value.id
        );

        const checkPrerequisitesResult = await rConsumptionServices.incomingRequests.checkPrerequisites({ requestId: receivedRequestResult.value.id });
        expect(checkPrerequisitesResult).toBeSuccessful();

        const event = await eventPromise;
        expect(event.data.newStatus).toBe(ConsumptionRequestStatus.DecisionRequired);
    });
});
