import { ConsumptionRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RequestReceivedEvent extends DataEvent<ConsumptionRequestDTO> {
    public static readonly namespace = "consumption.requestReceived";

    public constructor(eventTargetAddress: string, data: ConsumptionRequestDTO) {
        super(RequestReceivedEvent.namespace, eventTargetAddress, data);
    }
}
