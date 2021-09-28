import { CoreBuffer } from "@nmshd/crypto";
import { File, Message, MessageEnvelopeRecipient } from "@nmshd/transport";
import { MessageDTO, MessageWithAttachmentsDTO, RecipientDTO } from "../../../types";
import { RuntimeErrors } from "../../common";
import { FileMapper } from "../files/FileMapper";
import { DownloadAttachmentResponse } from "./DownloadAttachment";

export class MessageMapper {
    public static toDownloadAttachmentResponse(buffer: CoreBuffer, file: File): DownloadAttachmentResponse {
        if (!file.cache) {
            throw RuntimeErrors.general.cacheEmpty(File, file.id.toString());
        }

        return {
            content: buffer.buffer,
            filename: file.cache.filename ? file.cache.filename : file.id.toString(),
            mimetype: file.cache.mimetype
        };
    }

    public static toMessageWithAttachmentsDTO(message: Message, attachments: File[]): MessageWithAttachmentsDTO {
        if (!message.cache) {
            throw RuntimeErrors.general.cacheEmpty(Message, message.id.toString());
        }

        return {
            id: message.id.toString(),
            content: message.cache.content,
            createdBy: message.cache.createdBy.toString(),
            createdByDevice: message.cache.createdByDevice.toString(),
            recipients: message.cache.recipients.map((r) => this.toRecipient(r)),
            createdAt: message.cache.createdAt.toString(),
            relationshipIds: message.relationshipIds.map((r) => r.toString()),
            attachments: attachments.map((f) => FileMapper.toFileDTO(f))
        };
    }

    public static toMessageDTO(message: Message): MessageDTO {
        if (!message.cache) {
            throw RuntimeErrors.general.cacheEmpty(Message, message.id.toString());
        }

        return {
            id: message.id.toString(),
            content: message.cache.content.toJSON(),
            createdBy: message.cache.createdBy.toString(),
            createdByDevice: message.cache.createdByDevice.toString(),
            recipients: message.cache.recipients.map((r) => this.toRecipient(r)),
            relationshipIds: message.relationshipIds.map((r) => r.toString()),
            createdAt: message.cache.createdAt.toString(),
            attachments: message.cache.attachments.map((a) => a.toString())
        };
    }

    public static toMessageDTOList(messages: Message[]): MessageDTO[] {
        return messages.map((message) => this.toMessageDTO(message));
    }

    private static toRecipient(recipient: MessageEnvelopeRecipient): RecipientDTO {
        return {
            address: recipient.address.toString()
        };
    }
}
