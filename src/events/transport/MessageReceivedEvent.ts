import { MessageDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class MessageReceivedEvent extends DataEvent<MessageDTO> {
    public static readonly namespace = "transport.messageReceived";

    public constructor(data: MessageDTO) {
        super(MessageReceivedEvent.namespace, data);
    }
}
