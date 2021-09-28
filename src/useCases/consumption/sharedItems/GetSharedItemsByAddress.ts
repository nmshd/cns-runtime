import { Result } from "@js-soft/ts-utils";
import { SharedItem, SharedItemsController } from "@nmshd/consumption";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { SharedItemDTO } from "../../../types";
import { AddressValidator, RuntimeValidator, UseCase } from "../../common";
import { SharedItemsMapper } from "./SharedItemsMapper";

export interface GetSharedItemsByAddressRequest {
    address: string;
}

class GetSharedItemsByAddressRequestValidator extends RuntimeValidator<GetSharedItemsByAddressRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.address).fulfills(AddressValidator.required());
    }
}

export class GetSharedItemsByAddressUseCase extends UseCase<GetSharedItemsByAddressRequest, SharedItemDTO[]> {
    public constructor(@Inject private readonly sharedItemsController: SharedItemsController, @Inject validator: GetSharedItemsByAddressRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetSharedItemsByAddressRequest): Promise<Result<SharedItemDTO[]>> {
        const sharedItems = await this.sharedItemsController.getSharedItems({
            $or: [{ [nameof<SharedItem>((s) => s.sharedBy)]: request.address }, { [nameof<SharedItem>((s) => s.sharedWith)]: request.address }]
        });
        return Result.ok(SharedItemsMapper.toSharedItemDTOList(sharedItems));
    }
}
