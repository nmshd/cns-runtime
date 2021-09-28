import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, SharedItem, SharedItemsController } from "@nmshd/consumption";
import { AccountController, CoreAddress, CoreDate, CoreId, TransportIds } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { SharedItemDTO } from "../../../types";
import { AddressValidator, DateValidator, IdValidator, RuntimeValidator, UseCase } from "../../common";
import { SharedItemsMapper } from "./SharedItemsMapper";

export interface CreateSharedItemRequest {
    tags?: string[];
    sharedBy: string;
    sharedWith: string;
    sharedAt: string;
    reference?: string;
    content: any;
    succeedsItem?: string;
    succeedsAt?: string;
    expiresAt?: string;
}

class CreateSharedItemRequestValidator extends RuntimeValidator<CreateSharedItemRequest> {
    public constructor() {
        super();

        this.validateIfEachString((x) => x.tags)
            .isDefined()
            .whenDefined();

        this.validateIfString((x) => x.sharedBy).fulfills(AddressValidator.required());
        this.validateIfString((x) => x.sharedWith).fulfills(AddressValidator.required());
        this.validateIfString((x) => x.sharedAt).fulfills(DateValidator.required());
        this.validateIfString((x) => x.reference).fulfills(IdValidator.optional(TransportIds.generic));
        this.validateIfString((x) => x.content).isDefined();
        this.validateIfString((x) => x.succeedsItem).fulfills(IdValidator.optional(ConsumptionIds.sharedItem));
        this.validateIfString((x) => x.succeedsAt).fulfills(DateValidator.optional());
        this.validateIfString((x) => x.expiresAt).fulfills(DateValidator.optional());
    }
}

export class CreateSharedItemUseCase extends UseCase<CreateSharedItemRequest, SharedItemDTO> {
    public constructor(
        @Inject private readonly sharedItemsController: SharedItemsController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateSharedItemRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateSharedItemRequest): Promise<Result<SharedItemDTO>> {
        const sharedItem = await SharedItem.from({
            id: await ConsumptionIds.sharedItem.generate(),
            tags: request.tags,
            sharedBy: CoreAddress.from(request.sharedBy),
            sharedWith: CoreAddress.from(request.sharedWith),
            sharedAt: CoreDate.from(request.sharedAt),
            reference: request.reference ? CoreId.from(request.reference) : undefined,
            content: request.content,
            succeedsItem: request.succeedsItem ? CoreId.from(request.succeedsItem) : undefined,
            succeedsAt: request.succeedsAt ? CoreDate.from(request.succeedsAt) : undefined,
            expiresAt: request.expiresAt ? CoreDate.from(request.expiresAt) : undefined
        });

        await this.sharedItemsController.createSharedItem(sharedItem);
        await this.accountController.syncDatawallet();

        return Result.ok(SharedItemsMapper.toSharedItemDTO(sharedItem));
    }
}
