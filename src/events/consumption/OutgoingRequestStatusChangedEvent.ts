import { ConsumptionRequestStatus } from "@nmshd/consumption";
import { ConsumptionRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export interface OutgoingRequestStatusChangedEventData {
    request: ConsumptionRequestDTO;
    oldStatus: ConsumptionRequestStatus;
    newStatus: ConsumptionRequestStatus;
}

export class OutgoingRequestStatusChangedEvent extends DataEvent<OutgoingRequestStatusChangedEventData> {
    public static readonly namespace = "consumption.outgoingRequestStatusChanged";

    public constructor(eventTargetAddress: string, data: OutgoingRequestStatusChangedEventData) {
        super(OutgoingRequestStatusChangedEvent.namespace, eventTargetAddress, data);

        if (!data.request.isOwn) throw new Error("Cannot create this event for an incoming Request");
    }
}
