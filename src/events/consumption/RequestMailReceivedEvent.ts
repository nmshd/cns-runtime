import { RequestMail } from "@nmshd/content";
import { MessageDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RequestMailReceivedEvent extends DataEvent<MessageDTO> {
    public static readonly namespace = "consumption.requestMailReceived";

    public constructor(address: string, public readonly requestMail: RequestMail, data: MessageDTO) {
        super(RequestMailReceivedEvent.namespace, address, data);
    }
}
