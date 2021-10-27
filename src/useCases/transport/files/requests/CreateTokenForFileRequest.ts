export interface CreateTokenForFileRequest {
    /**
     * @format bkb-file
     */
    fileId: string;
    /**
     * @format date-time
     */
    expiresAt?: string;
    ephemeral?: boolean;
}
