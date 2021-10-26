import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreId, File, FileController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { FileDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { FileMapper } from "./FileMapper";
import { GetFileRequest } from "./requests/GetFileRequest";

export { GetFileRequest };

class GetFileRequestValidator extends RuntimeValidator<GetFileRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.id).fulfills(IdValidator.required(BackboneIds.file));
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
