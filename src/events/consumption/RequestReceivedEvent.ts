import { Request } from "@nmshd/content";
import { MessageDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RequestReceivedEvent extends DataEvent<MessageDTO> {
    public static readonly namespace = "consumption.requestReceived";

    public constructor(address: string, public readonly request: Request, data: MessageDTO) {
        super(RequestReceivedEvent.namespace, address, data);
    }
}
