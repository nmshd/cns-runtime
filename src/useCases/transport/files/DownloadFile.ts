import { Result } from "@js-soft/ts-utils";
import { CoreId, File, FileController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { FileMapper } from "./FileMapper";

export interface DownloadFileRequest {
    /**
     * @pattern FIL[A-Za-z0-9]{17}
     */
    id: string;
}

class Validator extends SchemaValidator<DownloadFileRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("DownloadFileRequest"));
    }
}

export interface DownloadFileResponse {
    content: Uint8Array;
    filename: string;
    mimetype: string;
}

export class DownloadFileUseCase extends UseCase<DownloadFileRequest, DownloadFileResponse> {
    public constructor(@Inject private readonly fileController: FileController, @Inject validator: Validator) {
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
