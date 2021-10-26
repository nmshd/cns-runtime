import { ErrorObject, ValidateFunction } from "ajv";
import { AbstractValidator, ValidationFailure, ValidationResult } from "fluent-ts-validator";
import { Definition } from "ts-json-schema-generator";

export class SchemaValidator<T> extends AbstractValidator<T> {
    private schema: Definition;
    private validateSchema: ValidateFunction;

    constructor(schema: Definition, validateSchema: ValidateFunction) {
        super();
        this.schema = schema;
        this.validateSchema = validateSchema;
    }

    /**
     * converts an error from ajv to an error for fluent-ts-validator
     */
    schemaErrorToValidationFailure<T>(err: ErrorObject, target: T): ValidationFailure {
        const errorMessage = `${err.instancePath} ${err.message}`.replace(/^\//, "").replace(/"/g, "");

        return new ValidationFailure(target, err.instancePath, undefined, undefined, errorMessage);
    }

    validate(input: T): ValidationResult {
        const valid = this.validateSchema(input);
        let result = new ValidationResult();

        if (valid) {
            return result;
        }

        result.addFailures(this.validateSchema.errors!.map(this.schemaErrorToValidationFailure));

        return result;
    }
}
