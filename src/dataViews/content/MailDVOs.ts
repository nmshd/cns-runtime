import { MessageDVOInternal, RecipientDVO } from "../transport/MessageDVO";
import { RequestDVO } from "./RequestDVOs";

interface RequestMailDVOInternal extends MailDVOInternal {
    // overwrite DTO
    requests: RequestDVO[];

    // new
    requestCount: number;
}

export interface RequestMailDVO extends RequestMailDVOInternal {
    type: "RequestMailDVO";
}

interface MailDVOInternal extends MessageDVOInternal {
    // overwrite DTO
    to: RecipientDVO[];
    cc: RecipientDVO[];
    subject: string;
    body: string;

    // new
    toCount: number;
    ccCount: number;
}

export interface MailDVO extends MailDVOInternal {
    type: "MailDVO";
}
