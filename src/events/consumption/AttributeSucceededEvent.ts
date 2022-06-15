import { ConsumptionAttributeDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class AttributeSucceededEvent extends DataEvent<ConsumptionAttributeDTO> {
    public static readonly namespace = "consumption.attributeSucceded";

    public constructor(eventTargetAddress: string, data: ConsumptionAttributeDTO) {
        super(AttributeSucceededEvent.namespace, eventTargetAddress, data);
    }
}
