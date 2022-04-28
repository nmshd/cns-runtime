import { ConsumptionRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RequestSentEvent extends DataEvent<ConsumptionRequestDTO> {
    public static readonly namespace = "consumption.requestSent";

    public constructor(eventTargetAddress: string, data: ConsumptionRequestDTO) {
        super(RequestSentEvent.namespace, eventTargetAddress, data);
    }
}
