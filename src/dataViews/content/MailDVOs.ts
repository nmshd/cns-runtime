import { DataViewObject } from "../DataViewObject";
import { RecipientDVO } from "../transport/MessageDVO";
import { RequestDVO } from "./RequestDVOs";

export interface RequestMailDVO extends Omit<MailDVO, "type"> {
    type: "RequestMailDVO";

    // overwrite DTO
    requests: RequestDVO[];

    // new
    requestCount: number;
}

export interface MailDVO extends DataViewObject {
    type: "MailDVO";

    // overwrite DTO
    to: RecipientDVO[];
    cc: RecipientDVO[];
    subject: string;
    body: string;

    // new
    toCount: number;
    ccCount: number;
}
