export interface CreateTokenQrCodeForFileRequest {
    /**
     * @format bkb-file
     */
    fileId: string;
    /**
     * @format date-time
     */
    expiresAt?: string;
}
