import { Result } from "@js-soft/ts-utils";
import { CryptoSecretKey } from "@nmshd/crypto";
import { AccountController, BackboneIds, CoreId, FileController, Token, TokenContentFile, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { FileDTO } from "../../../types";
import { LoadPeerFileRequest } from "../../../types/transport/requests/files/LoadPeerFileRequest";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { FileMapper } from "./FileMapper";

export { LoadPeerFileRequest };

class LoadPeerFileRequestValidator extends RuntimeValidator<LoadPeerFileRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x)
            .fulfills((x) => this.isCreatePeerFileFromIdAndKeyRequest(x) || this.isCreatePeerFileFromTokenReferenceRequest(x))
            .withFailureCode(RuntimeErrors.general.invalidPayload().code)
            .withFailureMessage(RuntimeErrors.general.invalidPayload().message);

        this.setupRulesForCreateFileFromIdAndKeyRequest();
        this.setupRulesForCreateFileFromTokenReferenceRequest();
    }

    private setupRulesForCreateFileFromIdAndKeyRequest() {
        this.validateIfString((x) => x.id)
            .fulfills(IdValidator.required(BackboneIds.file))
            .when(this.isCreatePeerFileFromIdAndKeyRequest);

        this.validateIfString((x) => x.secretKey)
            .isNotNull()
            .when(this.isCreatePeerFileFromIdAndKeyRequest);
    }

    private setupRulesForCreateFileFromTokenReferenceRequest() {
        this.validateIfString((x) => x.reference)
            .isNotNull()
            .fulfills(this.isTokenReference)
            .when(this.isCreatePeerFileFromTokenReferenceRequest);
    }

    private isTokenReference(tokenReference: string) {
        // "TOK" as Base64
        const tokInBase64 = "VE9L";
        return tokenReference.startsWith(tokInBase64);
    }

    private isCreatePeerFileFromIdAndKeyRequest(x: LoadPeerFileRequest): boolean {
        return !!x.id && !!x.secretKey;
    }

    private isCreatePeerFileFromTokenReferenceRequest(x: LoadPeerFileRequest): boolean {
        return !!x.reference;
    }
}

export class LoadPeerFileUseCase extends UseCase<LoadPeerFileRequest, FileDTO> {
    public constructor(
        @Inject private readonly fileController: FileController,
        @Inject private readonly tokenController: TokenController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: LoadPeerFileRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: LoadPeerFileRequest): Promise<Result<FileDTO>> {
        let createdFile: Result<FileDTO>;

        if (request.id && request.secretKey) {
            const key = await CryptoSecretKey.fromBase64(request.secretKey);
            createdFile = await this.loadFile(CoreId.from(request.id), key);
        } else if (request.reference) {
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
