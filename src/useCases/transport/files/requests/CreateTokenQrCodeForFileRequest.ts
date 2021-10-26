export interface CreateTokenQrCodeForFileRequest {
    fileId: string;
    /**
     * @format date-time
     */
    expiresAt?: string;
}
