import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { FileDTO, MessageDTO, MessageWithAttachmentsDTO } from "../../../types";
import {
    DownloadAttachmentRequest,
    DownloadAttachmentResponse,
    DownloadAttachmentUseCase,
    GetAttachmentMetadataRequest,
    GetAttachmentMetadataUseCase,
    GetMessageRequest,
    GetMessagesRequest,
    GetMessagesUseCase,
    GetMessageUseCase,
    SendMessageRequest,
    SendMessageUseCase
} from "../../../useCases";

export class MessagesFacade {
    public constructor(
        @Inject private readonly getMessagesUseCase: GetMessagesUseCase,
        @Inject private readonly getMessageUseCase: GetMessageUseCase,
        @Inject private readonly sendMessageUseCase: SendMessageUseCase,
        @Inject private readonly downloadAttachmentUseCase: DownloadAttachmentUseCase,
        @Inject private readonly getAttachmentMetadataUseCase: GetAttachmentMetadataUseCase
    ) {}

    public async sendMessage(request: SendMessageRequest): Promise<Result<MessageDTO>> {
        return await this.sendMessageUseCase.execute(request);
    }

    public async getMessages(request: GetMessagesRequest): Promise<Result<MessageDTO[]>> {
        return await this.getMessagesUseCase.execute(request);
    }

    public async getMessage(request: GetMessageRequest): Promise<Result<MessageWithAttachmentsDTO>> {
        return await this.getMessageUseCase.execute(request);
    }

    public async downloadAttachment(request: DownloadAttachmentRequest): Promise<Result<DownloadAttachmentResponse>> {
        return await this.downloadAttachmentUseCase.execute(request);
    }

    public async getAttachmentMetadata(request: GetAttachmentMetadataRequest): Promise<Result<FileDTO>> {
        return await this.getAttachmentMetadataUseCase.execute(request);
    }
}
