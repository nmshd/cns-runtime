import { Result } from "@js-soft/ts-utils";
import { CoreId, File, FileController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { QRCode, RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";

export interface CreateQrCodeForFileRequest {
    /**
     * @pattern FIL[A-z0-9]{17}
     */
    fileId: string;
}

export interface CreateQrCodeForFileResponse {
    qrCodeBytes: string;
}

class Validator extends SchemaValidator<CreateQrCodeForFileRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("CreateQrCodeForFileRequest"));
    }
}

export class CreateQrCodeForFileUseCase extends UseCase<CreateQrCodeForFileRequest, CreateQrCodeForFileResponse> {
    public constructor(@Inject private readonly fileController: FileController, @Inject validator: Validator) {
        super(validator);
    }

    protected async executeInternal(request: CreateQrCodeForFileRequest): Promise<Result<CreateQrCodeForFileResponse>> {
        const file = await this.fileController.getFile(CoreId.from(request.fileId));

        if (!file) {
            return Result.fail(RuntimeErrors.general.recordNotFound(File));
        }

        const qrCode = await QRCode.forTruncateable(file);
        return Result.ok({ qrCodeBytes: qrCode.asBase64() });
    }
}
