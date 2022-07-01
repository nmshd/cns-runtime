import { ApplicationError } from "@js-soft/ts-utils";

class General {
    public unknown(message: string, data?: any) {
        return new ApplicationError("error.runtime.unknown", message, data);
    }

    public alreadyInitialized() {
        return new ApplicationError("error.runtime.alreadyInitialized", "The runtime is already initialized. The init method can only be executed once.");
    }

    public notInitialized() {
        return new ApplicationError("error.runtime.notInitialized", "The runtime is not initialized. You must run init before you can start or stop the runtime.");
    }

    public alreadyStarted() {
        return new ApplicationError("error.runtime.alreadyStarted", "The runtime is already started. You should stop it first for a restart.");
    }

    public notStarted() {
        return new ApplicationError("error.runtime.notStarted", "The runtime is not started. You should start it before stopping.");
    }

    public recordNotFound(entityName?: string | Function): ApplicationError {
        return this.recordNotFoundWithMessage(`${entityName instanceof Function ? entityName.name : entityName} not found. Make sure the ID exists and the record is not expired.`);
    }

    public recordNotFoundWithMessage(message: string): ApplicationError {
        return new ApplicationError("error.runtime.recordNotFound", message);
    }

    public unauthorized(): ApplicationError {
        return new ApplicationError("error.runtime.unauthorized", "Unauthorized.");
    }

    public missingRequiredProperty(fieldName?: string): ApplicationError {
        return new ApplicationError("error.runtime.validation.missingRequiredProperty", `'${fieldName}' must not be empty.`);
    }

    public invalidPropertyValue(propertyName?: string, message?: string): ApplicationError {
        return new ApplicationError("error.runtime.validation.invalidPropertyValue", message ?? `The value of '${propertyName}' is not valid.`);
    }

    public invalidPayload(message?: string): ApplicationError {
        return new ApplicationError("error.runtime.validation.invalidPayload", message ?? "The given combination of properties in the payload is not supported.");
    }

    public notImplemented() {
        return new ApplicationError("error.runtime.methodNotImplemented", "The requested method is not yet implemented.");
    }

    public featureNotImplemented(message: string) {
        return new ApplicationError("error.runtime.featureNotImplemented", message);
    }

    public invalidTokenContent() {
        return new ApplicationError("error.runtime.invalidTokenContent", "The given token has an invalid content for this route.");
    }

    public cacheEmpty(entityName: string | Function, id: string) {
        return new ApplicationError("error.runtime.cacheEmpty", `The cache of ${entityName instanceof Function ? entityName.name : entityName} with id '${id}' is empty.`);
    }
}

class Serval {
    public unknownType(message: string) {
        return new ApplicationError("error.runtime.unknownType", message);
    }

    public general(message: string) {
        return new ApplicationError("error.runtime.servalError", message);
    }

    public requestDeserialization(message: string) {
        return new ApplicationError("error.runtime.requestDeserialization", message);
    }
}

class RelationshipTemplates {
    public cannotCreateQRCodeForPeerTemplate(): ApplicationError {
        return new ApplicationError("error.runtime.relationshipRequests.cannotCreateQRCodeForPeerTemplate", "You cannot create a QRCode for a peer template.");
    }
}

class RelationshipInfo {
    public relationshipInfoExists(relationshipId: string) {
        return new ApplicationError(
            "error.runtime.relationshipInfo.relationshipInfoExists",
            `RelationshipInfo for RelationshipId ${relationshipId} already exists. Try to update the RelationshipInfo instead.`
        );
    }
}

class Messages {
    public fileNotFoundInMessage(attachmentId: string) {
        return new ApplicationError("error.runtime.messages.fileNotFoundInMessage", `The requested file '${attachmentId}' was not found in the given message.`);
    }
}

class Startup {
    public noIdentityFound(): ApplicationError {
        return new ApplicationError("error.runtime.startup.noIdentityFound", "No identity information could be found. Please check your database integrity.");
    }

    public noActiveAccount(): ApplicationError {
        return new ApplicationError("error.runtime.startup.noActiveAccount", "No AccountController could be found. You might have to login first.");
    }

    public noActiveConsumptionController(): ApplicationError {
        return new ApplicationError("error.runtime.startup.noActiveConsumptionController", "No ConsumptionController could be found. You might have to login first.");
    }

    public noActiveExpander(): ApplicationError {
        return new ApplicationError("error.runtime.startup.noActiveExpander", "No DataViewExpander could be found. You might have to login first.");
    }

    public noDatabaseDefined(): ApplicationError {
        return new ApplicationError("error.runtime.startup.noDatabaseDefined", "No database is defined. Please check the database configuration.");
    }

    public noPlatformConnection(): ApplicationError {
        return new ApplicationError("error.runtime.startup.noPlatformConnection", "No platform connection could be established. Please check you network connectivity.");
    }

    public privateDeviceKeyInvalid(): ApplicationError {
        return new ApplicationError(
            "error.runtime.startup.privateDeviceKeyInvalid",
            "The private key of this device seems to be invalid. You should check your config or database connection."
        );
    }
}

class Database {
    public unknown(): ApplicationError {
        return new ApplicationError("error.runtime.database.unknown", "An unknown database error occured. Please check the logs.");
    }

    public connectionError(): ApplicationError {
        return new ApplicationError("error.runtime.database.connectionError", "Connection to database could not be established. Please check the database credentials.");
    }

    public quotaExceeded(): ApplicationError {
        return new ApplicationError("error.runtime.database.quotaExceeded", "It seems that the database quota exceeded. Please increase the database size.");
    }
}

class Challenges {
    public invalidSignature(): ApplicationError {
        return new ApplicationError("error.runtime.challenges.invalidSignature", "The signature is invalid.");
    }

    public invalidChallengeString(): ApplicationError {
        return new ApplicationError("error.runtime.challenges.invalidChallenge", "The challengeString is invalid.");
    }
}

export class RuntimeErrors {
    public static readonly general = new General();
    public static readonly serval = new Serval();
    public static readonly startup = new Startup();
    public static readonly database = new Database();
    public static readonly relationshipTemplates = new RelationshipTemplates();
    public static readonly messages = new Messages();
    public static readonly relationshipInfo = new RelationshipInfo();
    public static readonly challenges = new Challenges();
}
