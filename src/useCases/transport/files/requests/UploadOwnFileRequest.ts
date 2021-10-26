export interface UploadOwnFileRequest {
    content: Uint8Array;
    filename: string;
    mimetype: string;
    expiresAt: string;
    title: string;
    description?: string;
}
