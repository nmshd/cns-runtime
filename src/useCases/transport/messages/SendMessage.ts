import { Result } from "@js-soft/ts-utils";
import { AccountController, BackboneIds, CoreAddress, CoreId, File, FileController, MessageController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { MessageDTO } from "../../../types";
import { AddressValidator, IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { MessageMapper } from "./MessageMapper";

export interface SendMessageRequest {
    recipients: string[];
    content: any;
    attachments?: string[];
}

class SendMessageRequestValidator extends RuntimeValidator<SendMessageRequest> {
    public constructor() {
        super();

        this.validateIfIterable((x) => x.recipients).isNotEmpty();

        this.validateIfEachString((x) => x.recipients).fulfills(AddressValidator.required());

        this.validateIfAny((x) => x.content).isNotNull();

        this.validateIfEachString((x) => x.attachments).fulfills(IdValidator.required(BackboneIds.file));
    }
}

export class SendMessageUseCase extends UseCase<SendMessageRequest, MessageDTO> {
    public constructor(
        @Inject private readonly messageController: MessageController,
        @Inject private readonly fileController: FileController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: SendMessageRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: SendMessageRequest): Promise<Result<MessageDTO>> {
        const transformAttachmentsResult = await this.transformAttachments(request.attachments);
        if (transformAttachmentsResult.isError) {
            return Result.fail(transformAttachmentsResult.error);
        }

        const result = await this.messageController.sendMessage({
            recipients: request.recipients.map((r) => CoreAddress.from(r)),
            content: request.content,
            attachments: transformAttachmentsResult.value
        });

        await this.accountController.syncDatawallet();

        return Result.ok(MessageMapper.toMessageDTO(result));
    }

    private async transformAttachments(attachmentsIds?: string[]): Promise<Result<File[]>> {
        if (!attachmentsIds || attachmentsIds.length === 0) {
            return Result.ok([]);
        }

        const files: File[] = [];

        for (const attachmentId of attachmentsIds) {
            const file = await this.fileController.getFile(CoreId.from(attachmentId));

            if (!file) {
                return Result.fail(RuntimeErrors.general.recordNotFound(File));
            }

            files.push(file);
        }
        return Result.ok(files);
    }
}
