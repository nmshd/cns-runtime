import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, SharedItem, SharedItemsController } from "@nmshd/consumption";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RuntimeErrors } from "../..";
import { IdValidator, RuntimeValidator, UseCase } from "../../common";

export interface DeleteSharedItemRequest {
    id: string;
}

class DeleteSharedItemRequestValidator extends RuntimeValidator<DeleteSharedItemRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.sharedItem));
    }
}

export class DeleteSharedItemUseCase extends UseCase<DeleteSharedItemRequest, void> {
    public constructor(
        @Inject private readonly sharedItemsController: SharedItemsController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: DeleteSharedItemRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: DeleteSharedItemRequest): Promise<Result<void>> {
        const sharedItem = await this.sharedItemsController.getSharedItem(CoreId.from(request.id));
        if (!sharedItem) {
            return Result.fail(RuntimeErrors.general.recordNotFound(SharedItem));
        }

        await this.sharedItemsController.deleteSharedItem(sharedItem);
        await this.accountController.syncDatawallet();

        return Result.ok(undefined);
    }
}
