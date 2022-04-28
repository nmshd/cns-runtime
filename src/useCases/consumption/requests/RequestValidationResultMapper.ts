import { ValidationResult } from "@nmshd/consumption";
import { RequestValidationResultDTO } from "../../../types/consumption/RequestValidationResultDTO";

export class RequestValidationResultMapper {
    public static toRequestValidationResultDTO(request: ValidationResult): RequestValidationResultDTO {
        return {
            isSuccess: request.isSuccess(),
            code: request.isError() ? request.code : undefined,
            message: request.isError() ? request.message : undefined,
            items: request.items.map((item) => this.toRequestValidationResultDTO(item))
        };
    }
}
