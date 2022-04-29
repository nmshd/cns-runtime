import { ConsumptionRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class IncomingRequestReceivedEvent extends DataEvent<ConsumptionRequestDTO> {
    public static readonly namespace = "consumption.requestReceived";

    public constructor(eventTargetAddress: string, data: ConsumptionRequestDTO) {
        super(IncomingRequestReceivedEvent.namespace, eventTargetAddress, data);
    }
}
