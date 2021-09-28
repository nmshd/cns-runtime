export interface SharedItemDTO {
    id: string;
    tags?: string[];
    sharedBy: string;
    sharedWith: string;
    sharedAt: string;
    reference?: string;
    content: any;
    succeedsItem?: string;
    succeedsAt?: string;
    expiresAt?: string;
}
