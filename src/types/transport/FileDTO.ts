export interface FileDTO {
    id: string;
    filename: string;
    filesize: number;
    createdAt: string;
    createdBy: string;
    createdByDevice: string;
    expiresAt: string;
    mimetype: string;
    isOwn: boolean;
    title: string;
    secretKey: string;
    description?: string;
    deletedAt?: string;
    deletedBy?: string;
    deletedByDevice?: string;
}
