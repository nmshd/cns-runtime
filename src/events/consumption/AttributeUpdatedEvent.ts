import { ConsumptionAttributeDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class AttributeUpdatedEvent extends DataEvent<ConsumptionAttributeDTO> {
    public static readonly namespace = "consumption.attributeUpdated";

    public constructor(eventTargetAddress: string, data: ConsumptionAttributeDTO) {
        super(AttributeUpdatedEvent.namespace, eventTargetAddress, data);
    }
}
