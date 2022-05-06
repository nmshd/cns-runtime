import { ConsumptionRequestStatus } from "@nmshd/consumption";
import { RequestJSON, ResponseJSON } from "@nmshd/content";

export interface ConsumptionRequestDTO {
    id: string;
    isOwn: boolean;
    peer: string;
    createdAt: string;
    status: ConsumptionRequestStatus;
    content: RequestJSON;
    source?: ConsumptionRequestSourceDTO;
    response?: ConsumptionResponseDTO;
}

export interface ConsumptionRequestSourceDTO {
    type: "Message" | "RelationshipTemplate";
    reference: string;
}

export interface ConsumptionResponseSourceDTO {
    type: "Message" | "RelationshipChange";
    reference: string;
}

export interface ConsumptionResponseDTO {
    createdAt: string;
    content: ResponseJSON;
    source?: ConsumptionResponseSourceDTO;
}
