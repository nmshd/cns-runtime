import { MessageDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class MessageDeliveredEvent extends DataEvent<MessageDTO> {
    public static readonly namespace = "transport.messageDelivered";

    public constructor(eventTargetAddress: string, data: MessageDTO) {
        super(MessageDeliveredEvent.namespace, eventTargetAddress, data);
    }
}
