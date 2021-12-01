import { RelationshipChangeDTO } from "./RelationshipChangeDTO";
import { RelationshipTemplateDTO } from "./RelationshipTemplateDTO";

export enum RelationshipStatus {
    Pending = "Pending",
    Active = "Active",
    Rejected = "Rejected",
    Revoked = "Revoked",
    Terminating = "Terminating",
    Terminated = "Terminated"
}

export interface RelationshipDTO {
    id: string;
    template: RelationshipTemplateDTO;
    status: RelationshipStatus;
    peer: string;
    changes: RelationshipChangeDTO[];
    lastMessageSentAt?: string;
    lastMessageReceivedAt?: string;
}
