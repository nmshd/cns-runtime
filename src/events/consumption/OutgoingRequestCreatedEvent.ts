import { LocalRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class OutgoingRequestCreatedEvent extends DataEvent<LocalRequestDTO> {
    public static readonly namespace = "consumption.outgoingRequestCreated";

    public constructor(eventTargetAddress: string, data: LocalRequestDTO) {
        super(OutgoingRequestCreatedEvent.namespace, eventTargetAddress, data);

        if (!data.isOwn) throw new Error("Cannot create this event for an incoming Request");
    }
}
