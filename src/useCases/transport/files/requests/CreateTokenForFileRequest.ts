export interface CreateTokenForFileRequest {
    fileId: string;
    expiresAt?: string;
    ephemeral?: boolean;
}
