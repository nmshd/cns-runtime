import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreDate, CoreId, File, FileController, TokenContentFile, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { DateValidator, IdValidator, QRCode, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";

export interface CreateTokenQrCodeForFileRequest {
    fileId: string;
    expiresAt?: string;
}

class CreateTokenQrCodeForFileRequestValidator extends RuntimeValidator<CreateTokenQrCodeForFileRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.fileId).fulfills(IdValidator.required(BackboneIds.file));
        this.validateIfString((x) => x.expiresAt).fulfills(DateValidator.optional());
    }
}

export interface CreateTokenQrCodeForFileResponse {
    qrCodeBytes: string;
}

export class CreateTokenQrCodeForFileUseCase extends UseCase<CreateTokenQrCodeForFileRequest, CreateTokenQrCodeForFileResponse> {
    public constructor(
        @Inject private readonly fileController: FileController,
        @Inject private readonly tokenController: TokenController,
        @Inject validator: CreateTokenQrCodeForFileRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateTokenQrCodeForFileRequest): Promise<Result<CreateTokenQrCodeForFileResponse>> {
        const file = await this.fileController.getFile(CoreId.from(request.fileId));

        if (!file) {
            return Result.fail(RuntimeErrors.general.recordNotFound(File));
        }

        const tokenContent = await TokenContentFile.from({
            fileId: file.id,
            secretKey: file.secretKey
        });

        const defaultTokenExpiry = file.cache?.expiresAt ?? CoreDate.utc().add({ days: 12 });
        const tokenExpiry = request.expiresAt ? CoreDate.from(request.expiresAt) : defaultTokenExpiry;
        const token = await this.tokenController.sendToken({
            content: tokenContent,
            expiresAt: tokenExpiry,
            ephemeral: true
        });

        const qrCode = await QRCode.from(await token.truncate());
        return Result.ok({ qrCodeBytes: qrCode.asBase64() });
    }
}
