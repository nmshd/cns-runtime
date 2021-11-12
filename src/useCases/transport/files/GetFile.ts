import { Result } from "@js-soft/ts-utils";
import { CoreId, File, FileController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { FileDTO } from "../../../types";
import { GetFileRequest } from "../../../types/transport/requests/files/GetFileRequest";
import { RuntimeErrors, UseCase } from "../../common";
import { SchemaRepository } from "../../common/SchemaRepository";
import { SchemaValidator } from "../../common/SchemaValidator";
import { FileMapper } from "./FileMapper";

export { GetFileRequest };

export class GetFileRequestValidator extends SchemaValidator<GetFileRequest> {
    constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getJsonSchema("GetFileRequest"));
    }
}

export class GetFileUseCase extends UseCase<GetFileRequest, FileDTO> {
    public constructor(@Inject private readonly fileController: FileController, @Inject validator: GetFileRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetFileRequest): Promise<Result<FileDTO>> {
        const file = await this.fileController.getFile(CoreId.from(request.id));
        if (!file) {
            return Result.fail(RuntimeErrors.general.recordNotFound(File));
        }

        return Result.ok(FileMapper.toFileDTO(file));
    }
}
