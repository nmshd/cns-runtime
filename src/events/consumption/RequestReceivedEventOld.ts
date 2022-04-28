import { AttributesChangeRequest, AttributesRequest, AttributesShareRequest } from "@nmshd/content";
import { MessageDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RequestReceivedEventOld extends DataEvent<MessageDTO> {
    public static readonly namespace = "consumption.requestReceivedOld";

    public constructor(eventTargetAddress: string, public readonly request: AttributesChangeRequest | AttributesShareRequest | AttributesRequest, data: MessageDTO) {
        super(RequestReceivedEventOld.namespace, eventTargetAddress, data);
    }
}
