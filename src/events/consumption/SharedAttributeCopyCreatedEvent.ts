import { ConsumptionAttributeDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class SharedAttributeCopyCreatedEvent extends DataEvent<ConsumptionAttributeDTO> {
    public static readonly namespace = "consumption.sharedAttributeCopyCreated";

    public constructor(eventTargetAddress: string, data: ConsumptionAttributeDTO) {
        super(SharedAttributeCopyCreatedEvent.namespace, eventTargetAddress, data);
    }
}
