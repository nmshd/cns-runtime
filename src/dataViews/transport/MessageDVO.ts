import { DataViewObject } from "../DataViewObject";
import { FileDVO } from "./FileDVO";
import { IdentityDVO } from "./IdentityDVO";

export enum MessageStatus {
    Sent = "sent",
    Delivering = "delivering",
    Delivered = "delivered",
    Errorneous = "errorneous"
}

export interface MessageDVOInternal extends DataViewObject {
    // from DTO
    createdByDevice: string;
    createdAt: string;

    // overwrite DTO
    createdBy: IdentityDVO;
    recipients: RecipientDVO[]; // RecipientsDVO?
    attachments: FileDVO[];

    // new in DVO
    isOwn: boolean;
    recipientCount: number;
    attachmentCount: number;
    status: MessageStatus;
}

export interface MessageDVO extends MessageDVOInternal {
    type: "MessageDVO";
}

export interface RecipientDVO extends IdentityDVO {
    receivedAt?: string;
    receivedByDevice?: string;
}
