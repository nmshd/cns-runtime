export interface DeviceDTO {
    id: string;
    publicKey?: string;
    certificate?: string;
    name: string;
    description?: string;
    createdAt: string;
    createdByDevice: string;
    operatingSystem?: string;
    lastLoginAt?: string;
    type: string;
    username: string;
}
