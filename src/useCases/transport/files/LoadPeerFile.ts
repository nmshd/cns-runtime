import { Result } from "@js-soft/ts-utils";
import { CryptoSecretKey } from "@nmshd/crypto";
import { AccountController, BackboneIds, CoreId, FileController, Token, TokenContentFile, TokenController } from "@nmshd/transport";
import { ValidationResult } from "fluent-ts-validator";
import { Definition } from "ts-json-schema-generator";
import { Inject } from "typescript-ioc";
import { FileDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { JsonSchema, SchemaRepository } from "../../common/SchemaRepository";
import { SchemaValidator } from "../../common/SchemaValidator";
import { FileMapper } from "./FileMapper";

export interface LoadPeerFileViaSecretRequest {
    /**
     * @format fileId
     */
    id: string;
    /**
     * @minLength 100
     */
    secretKey: string;
}

export interface LoadPeerFileViaReferenceRequest {
    reference: string;
}

export type LoadPeerFileRequest = LoadPeerFileViaSecretRequest | LoadPeerFileViaReferenceRequest;

function isLoadPeerFileViaSecret(request: LoadPeerFileRequest): request is LoadPeerFileViaSecretRequest {
    return "id" in request && "secretKey" in request;
}

function isLoadPeerFileViaReference(request: LoadPeerFileRequest): request is LoadPeerFileViaSecretRequest {
    return "reference" in request;
}

class Validator extends SchemaValidator<LoadPeerFileRequest> {
    private loadViaSecretSchema: JsonSchema;
    private loadViaReferenceSchema: JsonSchema;

    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("LoadPeerFileRequest"));
        this.loadViaSecretSchema = schemaRepository.getSchema("LoadPeerFileViaSecretRequest");
        this.loadViaReferenceSchema = schemaRepository.getSchema("LoadPeerFileViaReferenceRequest");
    }

    public validate(input: LoadPeerFileRequest): ValidationResult {
        let validationResult = this.schema.validate(input);

        if (validationResult.isValid) {
            return new ValidationResult();
        }

        // any-of in combination with missing properties is a bit weird
        // when { reference: null | undefined } is passed, it ignores reference
        // and treats it like a LoadPeerFileViaSecret.
        // That's why we validate with the specific schema afterwards

        if (isLoadPeerFileViaReference(input)) {
            validationResult = this.loadViaReferenceSchema.validate(input);
        } else if (isLoadPeerFileViaSecret(input)) {
            validationResult = this.loadViaSecretSchema.validate(input);
        }

        return this.convertValidationResult(validationResult);
    }
}

class LoadPeerFileRequestValidator extends RuntimeValidator<LoadPeerFileRequest> {
    public constructor() {
        super();
    }

    private isTokenReference(tokenReference: string) {
        // "TOK" as Base64
        const tokInBase64 = "VE9L";
        return tokenReference.startsWith(tokInBase64);
    }
}

export class LoadPeerFileUseCase extends UseCase<LoadPeerFileRequest, FileDTO> {
    public constructor(
        @Inject private readonly fileController: FileController,
        @Inject private readonly tokenController: TokenController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: LoadPeerFileRequest): Promise<Result<FileDTO>> {
        let createdFile: Result<FileDTO>;

        if (isLoadPeerFileViaSecret(request)) {
            const key = await CryptoSecretKey.fromBase64(request.secretKey);
            createdFile = await this.loadFile(CoreId.from(request.id), key);
        } else if (isLoadPeerFileViaReference(request)) {
            createdFile = await this.createFileFromTokenReferenceRequest(request.reference);
        } else {
            throw new Error("Invalid request format.");
        }

        await this.accountController.syncDatawallet();
        return createdFile;
    }

    private async createFileFromTokenReferenceRequest(reference: string): Promise<Result<FileDTO>> {
        const token = await this.tokenController.loadPeerTokenByTruncated(reference, true);

        if (!token.cache) {
            throw RuntimeErrors.general.cacheEmpty(Token, token.id.toString());
        }

        if (!(token.cache.content instanceof TokenContentFile)) {
            return Result.fail(RuntimeErrors.general.invalidTokenContent());
        }

        const content = token.cache.content;
        return await this.loadFile(content.fileId, content.secretKey);
    }

    private async loadFile(id: CoreId, key: CryptoSecretKey): Promise<Result<FileDTO>> {
        const file = await this.fileController.loadPeerFile(id, key);
        return Result.ok(FileMapper.toFileDTO(file));
    }
}
