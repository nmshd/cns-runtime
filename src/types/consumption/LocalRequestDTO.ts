import { LocalRequestStatus } from "@nmshd/consumption";
import { RequestJSON, ResponseJSON } from "@nmshd/content";

export interface LocalRequestDTO {
    id: string;
    isOwn: boolean;
    peer: string;
    createdAt: string;
    status: LocalRequestStatus;
    content: RequestJSON;
    source?: LocalRequestSourceDTO;
    response?: LocalResponseDTO;
}

export interface LocalRequestSourceDTO {
    type: "Message" | "RelationshipTemplate";
    reference: string;
}

export interface LocalResponseSourceDTO {
    type: "Message" | "RelationshipChange";
    reference: string;
}

export interface LocalResponseDTO {
    createdAt: string;
    content: ResponseJSON;
    source?: LocalResponseSourceDTO;
}
