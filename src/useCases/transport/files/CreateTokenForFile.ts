import { Result } from "@js-soft/ts-utils";
import { AccountController, CoreDate, CoreId, File, FileController, TokenContentFile, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import { RuntimeErrors, UseCase } from "../../common";
import { SchemaRepository } from "../../common/SchemaRepository";
import { SchemaValidator } from "../../common/SchemaValidator";
import { TokenMapper } from "../tokens/TokenMapper";
import { CreateTokenForFileRequest } from "./requests/CreateTokenForFileRequest";

export { CreateTokenForFileRequest };

class CreateTokenForFileRequestValidator extends SchemaValidator<CreateTokenForFileRequest> {
    constructor(@Inject schemas: SchemaRepository) {
        let schema = schemas.getSchema("CreateTokenForFileRequest");
        let validateFunction = schemas.getValidationFunction("CreateTokenForFileRequest");

        super(schema, validateFunction);
        // this.validateIfString((x) => x.fileId).fulfills(IdValidator.required(BackboneIds.file));
        // this.validateIfString((x) => x.expiresAt).fulfills(DateValidator.optional());
    }
}

export class CreateTokenForFileUseCase extends UseCase<CreateTokenForFileRequest, TokenDTO> {
    public constructor(
        @Inject private readonly fileController: FileController,
        @Inject private readonly tokenController: TokenController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateTokenForFileRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateTokenForFileRequest): Promise<Result<TokenDTO>> {
        const file = await this.fileController.getFile(CoreId.from(request.fileId));

        if (!file) {
            return Result.fail(RuntimeErrors.general.recordNotFound(File));
        }

        const tokenContent = await TokenContentFile.from({
            fileId: file.id,
            secretKey: file.secretKey
        });

        const ephemeral = request.ephemeral ?? true;
        const defaultTokenExpiry = file.cache?.expiresAt ?? CoreDate.utc().add({ days: 12 });
        const tokenExpiry = request.expiresAt ? CoreDate.from(request.expiresAt) : defaultTokenExpiry;
        const token = await this.tokenController.sendToken({
            content: tokenContent,
            expiresAt: tokenExpiry,
            ephemeral
        });

        if (!ephemeral) {
            await this.accountController.syncDatawallet();
        }

        return Result.ok(await TokenMapper.toTokenDTO(token, ephemeral));
    }
}
