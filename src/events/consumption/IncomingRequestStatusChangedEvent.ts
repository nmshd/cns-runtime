import { ConsumptionRequestStatus } from "@nmshd/consumption";
import { ConsumptionRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export interface IncomingRequestStatusChangedEventData {
    request: ConsumptionRequestDTO;
    oldStatus: ConsumptionRequestStatus;
    newStatus: ConsumptionRequestStatus;
}

export class IncomingRequestStatusChangedEvent extends DataEvent<IncomingRequestStatusChangedEventData> {
    public static readonly namespace = "consumption.incomingRequestStatusChanged";

    public constructor(eventTargetAddress: string, data: IncomingRequestStatusChangedEventData) {
        super(IncomingRequestStatusChangedEvent.namespace, eventTargetAddress, data);

        if (data.request.isOwn) throw new Error("Cannot create this event for an outgoing Request");
    }
}
