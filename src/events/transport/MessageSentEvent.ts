import { MessageDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class MessageSentEvent extends DataEvent<MessageDTO> {
    public static readonly namespace = "transport.messageSent";

    public constructor(data: MessageDTO) {
        super(MessageSentEvent.namespace, data);
    }
}
