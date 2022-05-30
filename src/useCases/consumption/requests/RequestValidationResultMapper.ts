import { ValidationResult } from "@nmshd/consumption";
import { RequestValidationResultDTO } from "../../../types";

export class RequestValidationResultMapper {
    public static toRequestValidationResultDTO(request: ValidationResult): RequestValidationResultDTO {
        return {
            isSuccess: request.isSuccess(),
            code: request.isError() ? request.error.code : undefined,
            message: request.isError() ? request.error.message : undefined,
            items: request.items.map((item) => this.toRequestValidationResultDTO(item))
        };
    }
}
