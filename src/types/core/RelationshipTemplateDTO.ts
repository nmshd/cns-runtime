export interface RelationshipTemplateDTO {
    id: string;
    isOwn: boolean;
    createdBy: string;
    createdByDevice: string;
    createdAt: string;
    content: any;
    expiresAt?: string;
    maxNumberOfRelationships?: number;
}
