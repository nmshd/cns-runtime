import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttribute, ConsumptionAttributesController, ConsumptionIds } from "@nmshd/consumption";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";

export interface DeleteAttributeRequest {
    id: string;
}

class DeleteAttributeRequestValidator extends RuntimeValidator<DeleteAttributeRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.attribute));
    }
}

export class DeleteAttributeUseCase extends UseCase<DeleteAttributeRequest, void> {
    public constructor(
        @Inject private readonly attributeController: ConsumptionAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: DeleteAttributeRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: DeleteAttributeRequest): Promise<Result<void>> {
        const attribute = await this.attributeController.getAttribute(CoreId.from(request.id));
        if (!attribute) {
            return Result.fail(RuntimeErrors.general.recordNotFound(ConsumptionAttribute));
        }

        await this.attributeController.deleteAttribute(attribute);
        await this.accountController.syncDatawallet();

        return Result.ok(undefined);
    }
}
