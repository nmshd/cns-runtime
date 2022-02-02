import { Result } from "@js-soft/ts-utils";
import { CoreBuffer } from "@nmshd/crypto";
import { AccountController, CoreDate, FileController } from "@nmshd/transport";
import { DateTime } from "luxon";
import { Inject } from "typescript-ioc";
import { FileDTO } from "../../../types";
import { DateValidator, RuntimeValidator, UseCase } from "../../common";
import { FileMapper } from "./FileMapper";

export interface UploadOwnFileRequest {
    content: Uint8Array;
    filename: string;
    mimetype: string;
    expiresAt: string;
    title: string;
    description?: string;
}

class UploadOwnFileRequestValidator extends RuntimeValidator<UploadOwnFileRequest> {
    private _maxFileSize: number;
    public set maxFileSize(fileSize: number) {
        this._maxFileSize = fileSize;
    }

    public constructor() {
        super();

        this.validateIf((x) => x.content)
            .isNotNull()
            .fulfills((c) => c.length > 0)
            .withFailureMessage("file content is empty");

        this.validateIf((x) => x.content)
            .isNotNull()
            .fulfills((c) => c.byteLength <= this._maxFileSize)
            .withFailureMessage("file content is too large");

        this.validateIf((x) => x.filename).isNotNull();
        this.validateIf((x) => x.mimetype).isNotNull();

        this.validateIf((x) => x.title).isNotNull();

        this.validateIf((x) => x.expiresAt).isNotNull();

        this.validateIf((x) => x.expiresAt).fulfills(DateValidator.required());
        this.validateIf((x) => x.expiresAt)
            .fulfills((e) => DateTime.fromISO(e) > DateTime.utc())
            .withFailureMessage("'$propertyName' must be in the future.");
    }
}

export class UploadOwnFileUseCase extends UseCase<UploadOwnFileRequest, FileDTO> {
    public constructor(
        @Inject private readonly fileController: FileController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: UploadOwnFileRequestValidator
    ) {
        super(validator);
        validator.maxFileSize = fileController.config.platformMaxUnencryptedFileSize;
    }

    protected async executeInternal(request: UploadOwnFileRequest): Promise<Result<FileDTO>> {
        const file = await this.fileController.sendFile({
            buffer: CoreBuffer.from(request.content),
            title: request.title,
            description: request.description ?? "",
            filename: request.filename,
            mimetype: request.mimetype,
            expiresAt: CoreDate.from(request.expiresAt)
        });

        await this.accountController.syncDatawallet();

        return Result.ok(FileMapper.toFileDTO(file));
    }
}
