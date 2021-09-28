import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { SharedItemsController } from "@nmshd/consumption";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { SharedItemDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { SharedItemsMapper } from "./SharedItemsMapper";

export interface GetSharedItemsRequest {
    query?: any;
}

export class GetSharedItemsUseCase extends UseCase<GetSharedItemsRequest, SharedItemDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<SharedItemDTO>((c) => c.tags)]: true,
            [nameof<SharedItemDTO>((c) => c.sharedBy)]: true,
            [nameof<SharedItemDTO>((c) => c.sharedWith)]: true,
            [nameof<SharedItemDTO>((c) => c.sharedAt)]: true,
            [nameof<SharedItemDTO>((c) => c.reference)]: true,
            [nameof<SharedItemDTO>((c) => c.succeedsItem)]: true,
            [nameof<SharedItemDTO>((c) => c.succeedsAt)]: true,
            [nameof<SharedItemDTO>((c) => c.expiresAt)]: true
        },
        custom: {
            tags: (query: any, input: any) => {
                query["tags"] = {
                    $contains: input
                };
            }
        }
    });

    public constructor(@Inject private readonly sharedItemsController: SharedItemsController, @Inject validator: RuntimeValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetSharedItemsRequest): Promise<Result<SharedItemDTO[]>> {
        const query = GetSharedItemsUseCase.queryTranslator.parse(request.query);
        const sharedItem = await this.sharedItemsController.getSharedItems(query);
        return Result.ok(SharedItemsMapper.toSharedItemDTOList(sharedItem));
    }
}
