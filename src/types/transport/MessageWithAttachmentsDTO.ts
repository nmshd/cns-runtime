import { FileDTO } from "./FileDTO";
import { RecipientDTO } from "./RecipientDTO";

export interface MessageWithAttachmentsDTO {
    id: string;
    content: any;
    createdBy: string;
    createdByDevice: string;
    recipients: RecipientDTO[];
    createdAt: string;
    attachments: FileDTO[];
}
