import { Result } from "@js-soft/ts-utils";
import { AccountController, BackboneIds, CoreDate, CoreId, File, FileController, TokenContentFile, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import { DateValidator, IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { TokenMapper } from "../tokens/TokenMapper";

export interface CreateTokenForFileRequest {
    fileId: string;
    expiresAt?: string;
    ephemeral?: boolean;
}

class CreateTokenForFileRequestValidator extends RuntimeValidator<CreateTokenForFileRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.fileId).fulfills(IdValidator.required(BackboneIds.file));
        this.validateIfString((x) => x.expiresAt).fulfills(DateValidator.optional());
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
