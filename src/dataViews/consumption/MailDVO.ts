import { Mail } from "@nmshd/content";
import { MessageDVO } from "../core/MessageDVO";

export interface MailDVOProperties extends Mail {}

export interface MailDVO extends MessageDVO {
    mail: MailDVOProperties;
}
