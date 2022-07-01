import { LocalAttributeDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class SharedAttributeCopyCreatedEvent extends DataEvent<LocalAttributeDTO> {
    public static readonly namespace = "consumption.sharedAttributeCopyCreated";

    public constructor(eventTargetAddress: string, data: LocalAttributeDTO) {
        super(SharedAttributeCopyCreatedEvent.namespace, eventTargetAddress, data);
    }
}
