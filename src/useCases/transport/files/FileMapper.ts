import { CoreBuffer } from "@nmshd/crypto";
import { File } from "@nmshd/transport";
import { FileDTO } from "../../../types";
import { RuntimeErrors } from "../../common";
import { DownloadFileResponse } from "./DownloadFile";

export class FileMapper {
    public static toDownloadFileResponse(buffer: CoreBuffer, file: File): DownloadFileResponse {
        if (!file.cache) {
            throw RuntimeErrors.general.cacheEmpty(File, file.id.toString());
        }

        return {
            content: buffer.buffer,
            filename: file.cache.filename ? file.cache.filename : file.id.toString(),
            mimetype: file.cache.mimetype
        };
    }

    public static toFileDTO(file: File): FileDTO {
        if (!file.cache) {
            throw RuntimeErrors.general.cacheEmpty(File, file.id.toString());
        }
        return {
            id: file.id.toString(),
            filename: file.cache.filename,
            filesize: file.cache.filesize,
            createdAt: file.cache.createdAt.toString(),
            createdBy: file.cache.createdBy.toString(),
            createdByDevice: file.cache.createdByDevice.toString(),
            expiresAt: file.cache.expiresAt.toString(),
            mimetype: file.cache.mimetype,
            isOwn: file.isOwn,
            title: file.cache.title ?? "",
            secretKey: file.secretKey.toBase64(),
            description: file.cache.description,
            deletedAt: file.cache.deletedAt?.toString(),
            deletedBy: file.cache.deletedBy?.toString(),
            deletedByDevice: file.cache.deletedByDevice?.toString(),
            truncatedReference: file.truncate()
        };
    }

    public static toFileDTOList(files: File[]): FileDTO[] {
        return files.map((file) => this.toFileDTO(file));
    }
}
