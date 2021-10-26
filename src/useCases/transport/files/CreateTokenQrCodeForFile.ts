import { Result } from "@js-soft/ts-utils";
import { CoreDate, CoreId, File, FileController, TokenContentFile, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { QRCode, RuntimeErrors, UseCase } from "../../common";
import { SchemaRepository } from "../../common/SchemaRepository";
import { SchemaValidator } from "../../common/SchemaValidator";
import { CreateTokenQrCodeForFileRequest } from "./requests/CreateTokenQrCodeForFileRequest";

export { CreateTokenQrCodeForFileRequest };

// this.validateIfString((x) => x.fileId).fulfills(IdValidator.required(BackboneIds.file));
// this.validateIfString((x) => x.expiresAt).fulfills(DateValidator.optional());

export interface CreateTokenQrCodeForFileResponse {
    qrCodeBytes: string;
}

export class CreateTokenQrCodeForFileUseCase extends UseCase<CreateTokenQrCodeForFileRequest, CreateTokenQrCodeForFileResponse> {
    public constructor(@Inject private readonly fileController: FileController, @Inject private readonly tokenController: TokenController, @Inject schemas: SchemaRepository) {
        super(new SchemaValidator(schemas, "CreateTokenQrCodeForFileRequest"));
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
