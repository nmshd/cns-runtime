import { RecipientDTO } from "./RecipientDTO";

export interface MessageDTO {
    id: string;
    content: any;
    createdBy: string;
    createdByDevice: string;
    recipients: RecipientDTO[];
    relationshipIds: string[];
    createdAt: string;
    attachments: string[];
}
