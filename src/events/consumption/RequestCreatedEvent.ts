import { ConsumptionRequestDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RequestCreatedEvent extends DataEvent<ConsumptionRequestDTO> {
    public static readonly namespace = "consumption.requestCreated";

    public constructor(eventTargetAddress: string, data: ConsumptionRequestDTO) {
        super(RequestCreatedEvent.namespace, eventTargetAddress, data);
    }
}
