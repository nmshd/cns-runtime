import { IdentityDVO } from "../transport/IdentityDVO";
import { MessageDVOInternal } from "../transport/MessageDVO";
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
    to: IdentityDVO[];
    cc: IdentityDVO[];
    subject: string;
    body: string;

    // new
    toCount: number;
    ccCount: number;
}

export interface MailDVO extends MailDVOInternal {
    type: "MailDVO";
}
