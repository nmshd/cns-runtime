export interface CreateTokenForFileRequest {
    fileId: string;
    /**
     * @format date
     */
    expiresAt?: string;
    ephemeral?: boolean;
}
