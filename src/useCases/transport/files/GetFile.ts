import { Result } from "@js-soft/ts-utils";
import { CoreId, File, FileController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { FileDTO } from "../../../types";
import { RuntimeErrors, UseCase } from "../../common";
import { SchemaRepository } from "../../common/SchemaRepository";
import { SchemaValidator } from "../../common/SchemaValidator";
import { FileMapper } from "./FileMapper";
import { GetFileRequest } from "./requests/GetFileRequest";

export { GetFileRequest };

export class GetFileUseCase extends UseCase<GetFileRequest, FileDTO> {
    public constructor(@Inject private readonly fileController: FileController, @Inject schemas: SchemaRepository) {
        super(new SchemaValidator(schemas, "GetFileRequest"));
    }

    protected async executeInternal(request: GetFileRequest): Promise<Result<FileDTO>> {
        const file = await this.fileController.getFile(CoreId.from(request.id));
        if (!file) {
            return Result.fail(RuntimeErrors.general.recordNotFound(File));
        }

        return Result.ok(FileMapper.toFileDTO(file));
    }
}
