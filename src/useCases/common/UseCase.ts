import { ParsingError, ServalError, ValidationError } from "@js-soft/ts-serval";
import { ApplicationError, Result } from "@js-soft/ts-utils";
import { RequestError } from "@nmshd/transport";
import { ValidationResult } from "fluent-ts-validator";
import { PlatformErrorCodes } from "./PlatformErrorCodes";
import { RuntimeErrors } from "./RuntimeErrors";
import { IValidator } from "./validation/IValidator";

export abstract class UseCase<IRequest, IResponse> {
    public constructor(private readonly requestValidator?: IValidator<IRequest>) {}

    public async execute(request: IRequest): Promise<Result<IResponse>> {
        if (this.requestValidator) {
            const validationResult = this.requestValidator.validate(request);

            if (validationResult.isInvalid()) {
                return this.validationFailed(validationResult);
            }
        }

        try {
            return await this.executeInternal(request);
        } catch (e) {
            if (!(e instanceof Error)) {
                throw e;
            }

            return this.resultFromError(e);
        }
    }

    protected resultFromError(error: Error): Result<any> {
        if (error instanceof RequestError) {
            return this.handleRequestError(error);
        }

        if (error instanceof ServalError) {
            return this.handleServalError(error);
        }

        throw error;
    }

    private handleServalError(error: ServalError) {
        let runtimeError;
        if (error instanceof ParsingError || error instanceof ValidationError) {
            runtimeError = RuntimeErrors.serval.requestDeserialization(error.message);
        } else if (error.message.match(/Type '.+' was not found within reflection classes. You might have to install a module first./)) {
            runtimeError = RuntimeErrors.serval.unknownType(error.message);
        } else {
            runtimeError = RuntimeErrors.serval.general(error.message);
        }

        runtimeError.stack = error.stack;
        return Result.fail(runtimeError);
    }

    private handleRequestError(error: RequestError) {
        if (PlatformErrorCodes.isNotFoundError(error)) {
            return Result.fail(RuntimeErrors.general.recordNotFoundWithMessage(error.reason));
        }

        if (PlatformErrorCodes.isValidationError(error)) {
            return Result.fail(new ApplicationError(error.code, error.message));
        }

        if (PlatformErrorCodes.isUnexpectedError(error)) {
            return Result.fail(new ApplicationError(error.code, error.message));
        }

        throw error;
    }

    protected abstract executeInternal(request: IRequest): Promise<Result<IResponse>> | Result<IResponse>;

    private validationFailed(validationResult: ValidationResult): any {
        const firstFailure = validationResult.getFailures()[0];

        const errorCode = firstFailure.code ?? RuntimeErrors.general.invalidPropertyValue().code;
        const errorMessage =
            firstFailure.message?.replace(/\$propertyName/g, firstFailure.propertyName) ?? RuntimeErrors.general.invalidPropertyValue(firstFailure.propertyName).message;

        const result = Result.fail(new ApplicationError(errorCode, errorMessage));
        return result;
    }
}
