export interface ChallengeDTO {
    id: string;
    expiresAt: string;
    createdBy?: string;
    createdByDevice?: string;
    type: string;
    signature: string;
}
