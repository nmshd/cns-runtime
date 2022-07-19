import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { DraftsController } from "@nmshd/consumption";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { DraftDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { DraftMapper } from "./DraftMapper";

export interface GetDraftsQuery {
    type?: string | string[];
    createdAt?: string | string[];
    lastModifiedAt?: string | string[];
}

export interface GetDraftsRequest {
    query?: GetDraftsQuery;
}

export class GetDraftsUseCase extends UseCase<GetDraftsRequest, DraftDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<DraftDTO>((c) => c.type)]: true,
            [nameof<DraftDTO>((c) => c.createdAt)]: true,
            [nameof<DraftDTO>((c) => c.lastModifiedAt)]: true
        }
    });

    public constructor(@Inject private readonly draftController: DraftsController, @Inject validator: RuntimeValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetDraftsRequest): Promise<Result<DraftDTO[]>> {
        const query = GetDraftsUseCase.queryTranslator.parse(request.query);
        const drafts = await this.draftController.getDrafts(query);
        return Result.ok(DraftMapper.toDraftDTOList(drafts));
    }
}
