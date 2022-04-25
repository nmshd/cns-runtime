import { Result } from "@js-soft/ts-utils";
import { AccountController, CoreDate, CoreId, File, FileController, TokenContentFile, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import { RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { TokenMapper } from "../tokens/TokenMapper";

export interface CreateTokenForFileRequest {
    /**
     * @format fileId
     */
    fileId: string;
    /**
     * @format date-time
     */
    expiresAt?: string;
    ephemeral?: boolean;
}

class Validator extends SchemaValidator<CreateTokenForFileRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("CreateTokenForFileRequest"));
    }
}

export class CreateTokenForFileUseCase extends UseCase<CreateTokenForFileRequest, TokenDTO> {
    public constructor(
        @Inject private readonly fileController: FileController,
        @Inject private readonly tokenController: TokenController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateTokenForFileRequest): Promise<Result<TokenDTO>> {
        const file = await this.fileController.getFile(CoreId.from(request.fileId));

        if (!file) {
            return Result.fail(RuntimeErrors.general.recordNotFound(File));
        }

        const tokenContent = TokenContentFile.from({
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

        return Result.ok(TokenMapper.toTokenDTO(token, ephemeral));
    }
}
