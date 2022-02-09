import { ValidationResult } from "fluent-ts-validator";

export interface IValidator<T> {
    validate(value: T): PromiseLike<ValidationResult> | ValidationResult;
}
