export enum RelationshipChangeStatus {
    Pending = "Pending",
    Rejected = "Rejected",
    Revoked = "Revoked",
    Accepted = "Accepted"
}

export enum RelationshipChangeType {
    Creation = "Creation",
    Termination = "Termination",
    TerminationCancellation = "TerminationCancellation"
}

export interface RelationshipChangeRequestDTO {
    createdBy: string;
    createdByDevice: string;
    createdAt: string;
    content?: any;
}

export interface RelationshipChangeResponseDTO {
    createdBy: string;
    createdByDevice: string;
    createdAt: string;
    content?: any;
}

export interface RelationshipChangeDTO {
    id: string;
    request: RelationshipChangeRequestDTO;
    status: RelationshipChangeStatus;
    type: RelationshipChangeType;
    response?: RelationshipChangeResponseDTO;
}
