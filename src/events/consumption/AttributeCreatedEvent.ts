import { LocalAttributeDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class AttributeCreatedEvent extends DataEvent<LocalAttributeDTO> {
    public static readonly namespace = "consumption.attributeCreated";

    public constructor(eventTargetAddress: string, data: LocalAttributeDTO) {
        super(AttributeCreatedEvent.namespace, eventTargetAddress, data);
    }
}
