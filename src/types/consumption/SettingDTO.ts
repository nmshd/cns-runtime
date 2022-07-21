export interface SettingDTO {
    id: string;
    key: string;
    scope: string;
    reference?: string;
    value: any;
    createdAt: string;
    succeedsItem?: string;
    succeedsAt?: string;
}
