import { Result } from "@js-soft/ts-utils";
import { SharedItem, SharedItemsController } from "@nmshd/consumption";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { SharedItemDTO } from "../../../types";
import { AddressValidator, RuntimeValidator, UseCase } from "../../common";
import { SharedItemsMapper } from "./SharedItemsMapper";

export interface GetSharedItemsSharedByAddressRequest {
    address: string;
}

class GetSharedItemsSharedByAddressRequestValidator extends RuntimeValidator<GetSharedItemsSharedByAddressRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.address).fulfills(AddressValidator.required());
    }
}

export class GetSharedItemsSharedByAddressUseCase extends UseCase<GetSharedItemsSharedByAddressRequest, SharedItemDTO[]> {
    public constructor(@Inject private readonly sharedItemsController: SharedItemsController, @Inject validator: GetSharedItemsSharedByAddressRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetSharedItemsSharedByAddressRequest): Promise<Result<SharedItemDTO[]>> {
        const sharedItems = await this.sharedItemsController.getSharedItems({
            [nameof<SharedItem>((s) => s.sharedBy)]: request.address
        });
        return Result.ok(SharedItemsMapper.toSharedItemDTOList(sharedItems));
    }
}
