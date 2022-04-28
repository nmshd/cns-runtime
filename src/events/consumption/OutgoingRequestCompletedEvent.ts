import { ConsumptionRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class OutgoingRequestCompletedEvent extends DataEvent<ConsumptionRequestDTO> {
    public static readonly namespace = "consumption.outgoingRequestCompleted";

    public constructor(eventTargetAddress: string, data: ConsumptionRequestDTO) {
        super(OutgoingRequestCompletedEvent.namespace, eventTargetAddress, data);
    }
}
