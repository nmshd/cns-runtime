export interface RequestValidationResultDTO {
    isSuccess: boolean;

    code?: string;
    message?: string;

    items: RequestValidationResultDTO[];
}
