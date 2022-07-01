import { LocalAttributeDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class AttributeUpdatedEvent extends DataEvent<LocalAttributeDTO> {
    public static readonly namespace = "consumption.attributeUpdated";

    public constructor(eventTargetAddress: string, data: LocalAttributeDTO) {
        super(AttributeUpdatedEvent.namespace, eventTargetAddress, data);
    }
}
