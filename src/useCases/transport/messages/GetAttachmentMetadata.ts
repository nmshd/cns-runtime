import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreId, FileController, Message, MessageController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { FileDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { FileMapper } from "../files/FileMapper";

export interface GetAttachmentMetadataRequest {
    id: string;
    attachmentId: string;
}

class GetAttachmentMetadataRequestValidator extends RuntimeValidator<GetAttachmentMetadataRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.id).fulfills(IdValidator.required(BackboneIds.message));

        this.validateIf((x) => x.attachmentId).fulfills(IdValidator.required(BackboneIds.file));
    }
}

export class GetAttachmentMetadataUseCase extends UseCase<GetAttachmentMetadataRequest, FileDTO> {
    public constructor(
        @Inject private readonly messageController: MessageController,
        @Inject private readonly fileController: FileController,
        @Inject validator: GetAttachmentMetadataRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: GetAttachmentMetadataRequest): Promise<Result<FileDTO>> {
        const message = await this.messageController.getMessage(CoreId.from(request.id));
        if (!message) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Message));
        }

        if (!message.cache) {
            throw RuntimeErrors.general.cacheEmpty(Message, message.id.toString());
        }

        const attachment = message.cache.attachments.find((a) => a.equals(CoreId.from(request.attachmentId)));
        if (!attachment) {
            return Result.fail(RuntimeErrors.messages.fileNotFoundInMessage(request.attachmentId));
        }

        const file = await this.fileController.getFile(attachment);
        if (!file) {
            return Result.fail(RuntimeErrors.general.recordNotFound(File));
        }

        return Result.ok(FileMapper.toFileDTO(file));
    }
}
