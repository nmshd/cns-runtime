import { ConsumptionRequestStatus } from "@nmshd/consumption";
import { RequestJSON, ResponseJSON } from "@nmshd/content";

export interface ConsumptionRequestDTO {
    id: string;
    isOwn: boolean;
    peer: string;
    createdAt: string;
    content: RequestJSON;
    source?: ConsumptionRequestSourceDTO;
    response?: ConsumptionResponseDTO;
    status: ConsumptionRequestStatus;
    statusLog: ConsumptionRequestStatusLogEntryDTO[];
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

export interface ConsumptionRequestStatusLogEntryDTO {
    createdAt: string;
    oldStatus: ConsumptionRequestStatus;
    newStatus: ConsumptionRequestStatus;
    data?: object;
    code?: string;
}
