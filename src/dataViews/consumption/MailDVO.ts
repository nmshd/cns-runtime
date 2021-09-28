import { Mail } from "@nmshd/content";
import { MessageDVO } from "../transport/MessageDVO";

export interface MailDVOProperties extends Mail {}

export interface MailDVO extends MessageDVO {
    mail: MailDVOProperties;
}
