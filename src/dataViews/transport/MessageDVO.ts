import { DataViewObject } from "../DataViewObject";
import { FileDVO } from "./FileDVO";
import { IdentityDVO, IdentityDVOInternal } from "./IdentityDVO";

export enum MessageStatus {
    Received = "received",
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
    recipients: RecipientDVO[];
    attachments: FileDVO[];

    // new in DVO
    isOwn: boolean;
    recipientCount: number;
    attachmentCount: number;
    status: MessageStatus;

    /**
     * A peer of the message.
     */
    peer: IdentityDVO;
}

export interface MessageDVO extends MessageDVOInternal {
    type: "MessageDVO";
}

export interface RecipientDVO extends IdentityDVOInternal {
    type: "RecipientDVO";
    receivedAt?: string;
    receivedByDevice?: string;
}
