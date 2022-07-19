import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { CachedFile, File, FileController } from "@nmshd/transport";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { FileDTO } from "../../../types";
import { OwnerRestriction, RuntimeValidator, UseCase } from "../../common";
import { FileMapper } from "./FileMapper";

export interface GetFilesQuery {
    createdAt?: string | string[];
    createdBy?: string | string[];
    createdByDevice?: string | string[];
    description?: string | string[];
    expiresAt?: string | string[];
    filename?: string | string[];
    filesize?: string | string[];
    mimetype?: string | string[];
    title?: string | string[];
    isOwn?: string | string[];
}

export interface GetFilesRequest {
    query?: GetFilesQuery;
    ownerRestriction?: OwnerRestriction;
}

export class GetFilesUseCase extends UseCase<GetFilesRequest, FileDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<FileDTO>((c) => c.createdAt)]: true,
            [nameof<FileDTO>((c) => c.createdBy)]: true,
            [nameof<FileDTO>((c) => c.createdByDevice)]: true,
            [nameof<FileDTO>((c) => c.description)]: true,
            [nameof<FileDTO>((c) => c.expiresAt)]: true,
            [nameof<FileDTO>((c) => c.filename)]: true,
            [nameof<FileDTO>((c) => c.filesize)]: true,
            [nameof<FileDTO>((c) => c.mimetype)]: true,
            [nameof<FileDTO>((c) => c.title)]: true,
            [nameof<FileDTO>((c) => c.isOwn)]: true
        },
        alias: {
            [nameof<FileDTO>((c) => c.createdAt)]: `${nameof<File>((f) => f.cache)}.${nameof<CachedFile>((c) => c.createdAt)}`,
            [nameof<FileDTO>((c) => c.createdBy)]: `${nameof<File>((f) => f.cache)}.${nameof<CachedFile>((c) => c.createdBy)}`,
            [nameof<FileDTO>((c) => c.createdByDevice)]: `${nameof<File>((f) => f.cache)}.${nameof<CachedFile>((c) => c.createdByDevice)}`,
            [nameof<FileDTO>((c) => c.description)]: `${nameof<File>((f) => f.cache)}.${nameof<CachedFile>((c) => c.description)}`,
            [nameof<FileDTO>((c) => c.expiresAt)]: `${nameof<File>((f) => f.cache)}.${nameof<CachedFile>((c) => c.expiresAt)}`,
            [nameof<FileDTO>((c) => c.filename)]: `${nameof<File>((f) => f.cache)}.${nameof<CachedFile>((c) => c.filename)}`,
            [nameof<FileDTO>((c) => c.filesize)]: `${nameof<File>((f) => f.cache)}.${nameof<CachedFile>((c) => c.filesize)}`,
            [nameof<FileDTO>((c) => c.mimetype)]: `${nameof<File>((f) => f.cache)}.${nameof<CachedFile>((c) => c.mimetype)}`,
            [nameof<FileDTO>((c) => c.title)]: `${nameof<File>((f) => f.cache)}.${nameof<CachedFile>((c) => c.title)}`,
            [nameof<FileDTO>((c) => c.isOwn)]: nameof<File>((f) => f.isOwn)
        }
    });

    public constructor(@Inject private readonly fileController: FileController, @Inject validator: RuntimeValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetFilesRequest): Promise<Result<FileDTO[]>> {
        const query = GetFilesUseCase.queryTranslator.parse(request.query);

        if (request.ownerRestriction) {
            query[nameof<File>((f) => f.isOwn)] = request.ownerRestriction === OwnerRestriction.Own;
        }

        const files = await this.fileController.getFiles(query);
        return Result.ok(FileMapper.toFileDTOList(files));
    }
}
