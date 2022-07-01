import { LocalRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class IncomingRequestReceivedEvent extends DataEvent<LocalRequestDTO> {
    public static readonly namespace = "consumption.incomingRequestReceived";

    public constructor(eventTargetAddress: string, data: LocalRequestDTO) {
        super(IncomingRequestReceivedEvent.namespace, eventTargetAddress, data);

        if (data.isOwn) throw new Error("Cannot create this event for an outgoing Request");
    }
}
