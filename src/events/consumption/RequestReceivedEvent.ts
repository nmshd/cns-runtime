import { AttributesChangeRequest, AttributesRequest, AttributesShareRequest } from "@nmshd/content";
import { MessageDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RequestReceivedEvent extends DataEvent<MessageDTO> {
    public static readonly namespace = "consumption.requestReceived";

    public constructor(eventTargetAddress: string, public readonly request: AttributesChangeRequest | AttributesShareRequest | AttributesRequest, data: MessageDTO) {
        super(RequestReceivedEvent.namespace, eventTargetAddress, data);
    }
}
