import { MessageDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class MessageDeliveredEvent extends DataEvent<MessageDTO> {
    public static readonly namespace = "transport.messageDelivered";

    public constructor(data: MessageDTO) {
        super(MessageDeliveredEvent.namespace, data);
    }
}
