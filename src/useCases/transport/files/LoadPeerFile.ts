import { Result } from "@js-soft/ts-utils";
import { CryptoSecretKey } from "@nmshd/crypto";
import { AccountController, BackboneIds, CoreId, FileController, Token, TokenContentFile, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { FileDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { SchemaRepository } from "../../common/SchemaRepository";
import { SchemaValidator } from "../../common/SchemaValidator";
import { FileMapper } from "./FileMapper";

interface LoadPeerFileViaSecret {
    /**
     * @format fileId
     */
    id: string;
    secretKey: string;
}

interface LoadPeerFileViaReference {
    reference: string;
}

export type LoadPeerFileRequest = LoadPeerFileViaSecret | LoadPeerFileViaReference;

function isLoadPeerFileViaSecret(request: LoadPeerFileRequest): request is LoadPeerFileViaSecret {
    return "id" in request && "secretKey" in request;
}

function isLoadPeerFileViaReference(request: LoadPeerFileRequest): request is LoadPeerFileViaSecret {
    return "reference" in request;
}

class Validator extends SchemaValidator<LoadPeerFileRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("LoadPeerFileRequest"));
    }
}

class LoadPeerFileRequestValidator extends RuntimeValidator<LoadPeerFileRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x)
            .fulfills((x) => isLoadPeerFileViaSecret(x) || isLoadPeerFileViaReference(x))
            .withFailureCode(RuntimeErrors.general.invalidPayload().code)
            .withFailureMessage(RuntimeErrors.general.invalidPayload().message);

        this.setupRulesForCreateFileFromIdAndKeyRequest();
        this.setupRulesForCreateFileFromTokenReferenceRequest();
    }

    private setupRulesForCreateFileFromIdAndKeyRequest() {
        // @ts-ignore
        this.validateIfString((x) => x.id)
            .fulfills(IdValidator.required(BackboneIds.file))
            .when(isLoadPeerFileViaSecret);

        // @ts-ignore
        this.validateIfString((x) => x.secretKey)
            .isNotNull()
            .when(isLoadPeerFileViaSecret);
    }

    private setupRulesForCreateFileFromTokenReferenceRequest() {
        // @ts-ignore
        this.validateIfString((x) => x.reference)
            .isNotNull()
            .fulfills(this.isTokenReference)
            .when(isLoadPeerFileViaReference);
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
