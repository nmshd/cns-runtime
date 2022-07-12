import { RecipientDTO } from "./RecipientDTO";

export interface MessageDTO {
    id: string;
    content: any;
    createdBy: string;
    createdByDevice: string;
    recipients: RecipientDTO[];
    createdAt: string;
    attachments: string[];
}
