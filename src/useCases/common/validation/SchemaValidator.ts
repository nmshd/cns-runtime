import { ErrorObject } from "ajv";
import { ValidationFailure, ValidationResult } from "fluent-ts-validator";
import { IValidator } from "..";
import { JsonSchema, JsonSchemaValidationResult } from "../SchemaRepository";

export class SchemaValidator<T> implements IValidator<T> {
    public constructor(protected readonly schema: JsonSchema) {}

    public validate(input: T): ValidationResult {
        const validationResult = this.schema.validate(input);

        return this.convertValidationResult(validationResult);
    }

    protected convertValidationResult(validationResult: JsonSchemaValidationResult): ValidationResult {
        const result = new ValidationResult();

        if (validationResult.isValid) {
            return result;
        }

        result.addFailures(validationResult.errors!.map(this.schemaErrorToValidationFailure));

        return result;
    }

    private schemaErrorToValidationFailure<T>(err: ErrorObject, target: T): ValidationFailure {
        const errorMessage = `${err.instancePath} ${err.message}`.replace(/^\//, "").replace(/"/g, "");

        return new ValidationFailure(target, err.instancePath, undefined, undefined, errorMessage);
    }
}
