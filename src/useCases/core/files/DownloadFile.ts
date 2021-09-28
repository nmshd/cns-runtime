import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreId, File, FileController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { FileMapper } from "./FileMapper";

export interface DownloadFileRequest {
    id: string;
}

class DownloadFileRequestValidator extends RuntimeValidator<DownloadFileRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.id).fulfills(IdValidator.required(BackboneIds.file));
    }
}

export interface DownloadFileResponse {
    content: Uint8Array;
    filename: string;
    mimetype: string;
}

export class DownloadFileUseCase extends UseCase<DownloadFileRequest, DownloadFileResponse> {
    public constructor(@Inject private readonly fileController: FileController, @Inject validator: DownloadFileRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: DownloadFileRequest): Promise<Result<DownloadFileResponse>> {
        const fileId = CoreId.from(request.id);
        const fileMetadata = await this.fileController.getFile(fileId);

        if (!fileMetadata) {
            return Result.fail(RuntimeErrors.general.recordNotFound(File));
        }

        const fileContent = await this.fileController.downloadFileContent(fileMetadata.id);

        const result = Result.ok(FileMapper.toDownloadFileResponse(fileContent, fileMetadata));

        return result;
    }
}
