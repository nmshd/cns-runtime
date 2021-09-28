import { RequestMail } from "@nmshd/content";
import { MailDVO, MailDVOProperties } from "./MailDVO";
import { RequestDVO } from "./RequestDVO";

export interface RequestMailDVOProperties extends RequestMail, MailDVOProperties {
    requestObjects: RequestDVO[];
    requestCount: number;
}

export interface RequestMailDVO extends MailDVO {
    requestMail: RequestMailDVOProperties;
}
