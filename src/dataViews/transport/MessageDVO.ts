import { MessageDTO } from "../../types";
import { DataViewObject } from "../DataViewObject";
import { FileDVO } from "./FileDVO";
import { IdentityDVO } from "./IdentityDVO";

export enum MessageStatus {
    Sent = "sent",
    Delivering = "delivering",
    Delivered = "delivered",
    Errorneous = "errorneous"
}

export interface MessageDVOProperties extends MessageDTO {
    isOwn: boolean;
    createdByObject: IdentityDVO;
    peerObjects: IdentityDVO[];
    recipientObjects: IdentityDVO[];
    recipientCount: number;
    attachmentObjects: FileDVO[];
    attachmentCount: number;

    status: MessageStatus;
}

export interface MessageDVO extends DataViewObject {
    message: MessageDVOProperties;
}
