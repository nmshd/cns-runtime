export interface CreateTokenForFileRequest {
    fileId: string;
    /**
     * @format date-time
     */
    expiresAt?: string;
    ephemeral?: boolean;
}
