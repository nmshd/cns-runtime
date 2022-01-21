import { DataViewObject } from "../DataViewObject";
import { FileDVO } from "./FileDVO";
import { IdentityDVO } from "./IdentityDVO";

export enum MessageStatus {
    /**
     * Message was received
     */
    Received = "Received",
    /**
     * Message was sent but is not yet received by every recipient
     */
    Delivering = "Delivering",
    /**
     * Message was sent and was received by every recipient
     */
    Delivered = "Delivered"
}

export interface MessageDVO extends DataViewObject {
    type: "MessageDVO";

    /**
     * The device id of the sender's device which sent the message to
     * the backbone
     */
    createdByDevice: string;

    /**
     * The point in time the message has been created on the backbone
     * (in ISO format)
     */
    createdAt: string;

    /**
     * The sender of the message
     */
    createdBy: IdentityDVO;

    /**
     * The recipients of the message
     */
    recipients: RecipientDVO[];

    /**
     * Attachments of the message
     */
    attachments: FileDVO[];

    /**
     * Whether or not the current account is the author/sender of the message
     */
    isOwn: boolean;

    /**
     * The count of recipients
     */
    recipientCount: number;

    /**
     * The count of attachments
     */
    attachmentCount: number;

    /**
     * A delivery status of the message
     */
    status: MessageStatus;

    /**
     * The message's status in the corresponding internationalization
     * format, e.g. i18n://dvo.message.Received
     */
    statusText: string;

    /**
     * The peer of the message. If the message was sent to multiple
     * recipients, this is the first one of them.
     */
    peer: IdentityDVO;
}

export interface RecipientDVO extends Omit<IdentityDVO, "type"> {
    type: "RecipientDVO";

    /**
     * The point in time the recipient received the message
     * (in ISO format)
     */
    receivedAt?: string;

    /**
     * The device id of the recipient's device which received
     * the message
     */
    receivedByDevice?: string;
}
