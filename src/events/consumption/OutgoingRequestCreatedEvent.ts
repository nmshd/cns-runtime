import { ConsumptionRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class OutgoingRequestCreatedEvent extends DataEvent<ConsumptionRequestDTO> {
    public static readonly namespace = "consumption.outgoingRquestCreated";

    public constructor(eventTargetAddress: string, data: ConsumptionRequestDTO) {
        super(OutgoingRequestCreatedEvent.namespace, eventTargetAddress, data);
    }
}
