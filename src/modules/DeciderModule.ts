import { ConsumptionRequestStatus } from "@nmshd/consumption";
import { IncomingRequestStatusChangedEvent } from "../events";
import { RuntimeModule } from "../extensibility";

export class DeciderModule extends RuntimeModule {
    public init(): void | Promise<void> {
        // Nothing to do here
    }

    public start(): void | Promise<void> {
        this.subscribe(IncomingRequestStatusChangedEvent, this.handleIncomingRequestStatusChanged.bind(this));
    }

    private async handleIncomingRequestStatusChanged(event: IncomingRequestStatusChangedEvent) {
        if (event.data.newStatus !== ConsumptionRequestStatus.DecisionRequired) return;

        const services = this.runtime.getServices(event.eventTargetAddress);
        const requireManualDecisionResult = await services.consumptionServices.incomingRequests.requireManualDecision({ requestId: event.data.request.id });
        if (requireManualDecisionResult.isError) {
            this.logger.error(`Could not require manual decision for request ${event.data.request.id}`, requireManualDecisionResult.error);
            return;
        }
    }

    public stop(): void | Promise<void> {
        this.unsubscribeAll();
    }
}
