import { LocalAttributeDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class AttributeDeletedEvent extends DataEvent<LocalAttributeDTO> {
    public static readonly namespace = "consumption.attributeDeleted";

    public constructor(eventTargetAddress: string, data: LocalAttributeDTO) {
        super(AttributeDeletedEvent.namespace, eventTargetAddress, data);
    }
}
