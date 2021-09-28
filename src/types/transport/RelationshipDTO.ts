import { RelationshipChangeDTO } from "./RelationshipChangeDTO";
import { RelationshipTemplateDTO } from "./RelationshipTemplateDTO";

export interface RelationshipDTO {
    id: string;
    template: RelationshipTemplateDTO;
    status: string;
    peer: string;
    changes: RelationshipChangeDTO[];
    lastMessageSentAt?: string;
    lastMessageReceivedAt?: string;
}
