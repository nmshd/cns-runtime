import { ConsumptionAttributeDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class AttributeDeletedEvent extends DataEvent<ConsumptionAttributeDTO> {
    public static readonly namespace = "consumption.attributeDeleted";

    public constructor(eventTargetAddress: string, data: ConsumptionAttributeDTO) {
        super(AttributeDeletedEvent.namespace, eventTargetAddress, data);
    }
}
