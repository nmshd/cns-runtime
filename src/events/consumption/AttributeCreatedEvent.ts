import { ConsumptionAttributeDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class AttributeCreatedEvent extends DataEvent<ConsumptionAttributeDTO> {
    public static readonly namespace = "consumption.attributeCreated";

    public constructor(eventTargetAddress: string, data: ConsumptionAttributeDTO) {
        super(AttributeCreatedEvent.namespace, eventTargetAddress, data);
    }
}
