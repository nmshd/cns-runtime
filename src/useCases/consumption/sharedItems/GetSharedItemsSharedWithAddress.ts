import { Result } from "@js-soft/ts-utils";
import { SharedItem, SharedItemsController } from "@nmshd/consumption";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { SharedItemDTO } from "../../../types";
import { AddressValidator, RuntimeValidator, UseCase } from "../../common";
import { SharedItemsMapper } from "./SharedItemsMapper";

export interface GetSharedItemsSharedWithAddressRequest {
    address: string;
}

class GetSharedItemsSharedWithAddressRequestValidator extends RuntimeValidator<GetSharedItemsSharedWithAddressRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.address).fulfills(AddressValidator.required());
    }
}

export class GetSharedItemsSharedWithAddressUseCase extends UseCase<GetSharedItemsSharedWithAddressRequest, SharedItemDTO[]> {
    public constructor(@Inject private readonly sharedItemsController: SharedItemsController, @Inject validator: GetSharedItemsSharedWithAddressRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetSharedItemsSharedWithAddressRequest): Promise<Result<SharedItemDTO[]>> {
        const sharedItems = await this.sharedItemsController.getSharedItems({
            [nameof<SharedItem>((s) => s.sharedWith)]: request.address
        });
        return Result.ok(SharedItemsMapper.toSharedItemDTOList(sharedItems));
    }
}
