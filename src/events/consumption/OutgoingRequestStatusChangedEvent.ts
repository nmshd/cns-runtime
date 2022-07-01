import { LocalRequestStatus } from "@nmshd/consumption";
import { LocalRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export interface OutgoingRequestStatusChangedEventData {
    request: LocalRequestDTO;
    oldStatus: LocalRequestStatus;
    newStatus: LocalRequestStatus;
}

export class OutgoingRequestStatusChangedEvent extends DataEvent<OutgoingRequestStatusChangedEventData> {
    public static readonly namespace = "consumption.outgoingRequestStatusChanged";

    public constructor(eventTargetAddress: string, data: OutgoingRequestStatusChangedEventData) {
        super(OutgoingRequestStatusChangedEvent.namespace, eventTargetAddress, data);

        if (!data.request.isOwn) throw new Error("Cannot create this event for an incoming Request");
    }
}
