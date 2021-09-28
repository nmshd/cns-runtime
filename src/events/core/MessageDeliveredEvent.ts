import { MessageDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class MessageDeliveredEvent extends DataEvent<MessageDTO> {
    public static readonly namespace = "core.messageDelivered";

    public constructor(data: MessageDTO) {
        super(MessageDeliveredEvent.namespace, data);
    }
}
