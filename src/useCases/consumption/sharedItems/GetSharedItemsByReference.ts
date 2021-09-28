import { Result } from "@js-soft/ts-utils";
import { SharedItem, SharedItemsController } from "@nmshd/consumption";
import { TransportIds } from "@nmshd/transport";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { SharedItemDTO } from "../../../types";
import { IdValidator, RuntimeValidator, UseCase } from "../../common";
import { SharedItemsMapper } from "./SharedItemsMapper";

export interface GetSharedItemsByReferenceRequest {
    reference: string;
}

class GetSharedItemsByReferenceRequestValidator extends RuntimeValidator<GetSharedItemsByReferenceRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.reference).fulfills(IdValidator.required(TransportIds.generic));
    }
}

export class GetSharedItemsByReferenceUseCase extends UseCase<GetSharedItemsByReferenceRequest, SharedItemDTO[]> {
    public constructor(@Inject private readonly sharedItemsController: SharedItemsController, @Inject validator: GetSharedItemsByReferenceRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetSharedItemsByReferenceRequest): Promise<Result<SharedItemDTO[]>> {
        const sharedItems = await this.sharedItemsController.getSharedItems({
            [nameof<SharedItem>((s) => s.reference)]: request.reference
        });
        return Result.ok(SharedItemsMapper.toSharedItemDTOList(sharedItems));
    }
}
