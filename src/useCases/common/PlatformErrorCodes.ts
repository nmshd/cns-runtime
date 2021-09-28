import { RequestError } from "@nmshd/transport";

export class PlatformErrorCodes {
    public static readonly NOT_FOUND = "error.platform.recordNotFound";
    public static readonly UNAUTHORIZED = "error.platform.unauthorized";
    public static readonly FORBIDDEN = "error.platform.forbidden";
    public static readonly INVALID_PROPERTY_VALUE = "error.platform.invalidPropertyValue";
    public static readonly UNEXPECTED = "error.platform.unexpected";

    public static isNotFoundError(error: RequestError): boolean {
        return error.code === PlatformErrorCodes.NOT_FOUND;
    }

    public static isValidationError(error: RequestError): boolean {
        return error.code.startsWith("error.platform.validation");
    }

    public static isUnexpectedError(error: RequestError): boolean {
        return error.code.startsWith("error.platform.validation");
    }
}
