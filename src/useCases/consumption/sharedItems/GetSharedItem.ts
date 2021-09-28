import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, SharedItem, SharedItemsController } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { SharedItemDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { SharedItemsMapper } from "./SharedItemsMapper";

export interface GetSharedItemRequest {
    id: string;
}

class GetSharedItemRequestValidator extends RuntimeValidator<GetSharedItemRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.sharedItem));
    }
}

export class GetSharedItemUseCase extends UseCase<GetSharedItemRequest, SharedItemDTO> {
    public constructor(@Inject private readonly sharedItemsController: SharedItemsController, @Inject validator: GetSharedItemRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetSharedItemRequest): Promise<Result<SharedItemDTO>> {
        const sharedItem = await this.sharedItemsController.getSharedItem(CoreId.from(request.id));
        if (!sharedItem) {
            return Result.fail(RuntimeErrors.general.recordNotFound(SharedItem));
        }

        return Result.ok(SharedItemsMapper.toSharedItemDTO(sharedItem));
    }
}
