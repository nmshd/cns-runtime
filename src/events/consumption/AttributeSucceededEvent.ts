import { LocalAttributeDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class AttributeSucceededEvent extends DataEvent<LocalAttributeDTO> {
    public static readonly namespace = "consumption.attributeSucceded";

    public constructor(eventTargetAddress: string, data: LocalAttributeDTO) {
        super(AttributeSucceededEvent.namespace, eventTargetAddress, data);
    }
}
