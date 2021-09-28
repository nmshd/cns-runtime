import { Serializable } from "@js-soft/ts-serval";
import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, SharedItem, SharedItemsController } from "@nmshd/consumption";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RuntimeErrors } from "../..";
import { SharedItemDTO } from "../../../types";
import { IdValidator, RuntimeValidator, UseCase } from "../../common";
import { SharedItemsMapper } from "./SharedItemsMapper";

export interface UpdateSharedItemRequest {
    id: string;
    content: any;
}

class UpdateSharedItemRequestValidator extends RuntimeValidator<UpdateSharedItemRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.sharedItem));
        this.validateIfAny((x) => x.content).isDefined();
    }
}

export class UpdateSharedItemUseCase extends UseCase<UpdateSharedItemRequest, SharedItemDTO> {
    public constructor(
        @Inject private readonly sharedItemsController: SharedItemsController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: UpdateSharedItemRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: UpdateSharedItemRequest): Promise<Result<SharedItemDTO>> {
        const sharedItem = await this.sharedItemsController.getSharedItem(CoreId.from(request.id));
        if (!sharedItem) {
            return Result.fail(RuntimeErrors.general.recordNotFound(SharedItem));
        }

        sharedItem.content = Serializable.fromUnknown(request.content);
        await this.sharedItemsController.updateSharedItem(sharedItem);
        await this.accountController.syncDatawallet();

        return Result.ok(SharedItemsMapper.toSharedItemDTO(sharedItem));
    }
}
