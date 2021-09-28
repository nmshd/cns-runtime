import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttribute, ConsumptionAttributesController } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RuntimeErrors, RuntimeValidator, UseCase } from "../../common";

export interface DeleteAttributeByNameRequest {
    name: string;
}

class DeleteAttributeByNameRequestValidator extends RuntimeValidator<DeleteAttributeByNameRequest> {
    public constructor() {
        super();

        this.validateIfString((d) => d.name).isDefined();
    }
}

export class DeleteAttributeByNameUseCase extends UseCase<DeleteAttributeByNameRequest, void> {
    public constructor(
        @Inject private readonly attributeController: ConsumptionAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: DeleteAttributeByNameRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: DeleteAttributeByNameRequest): Promise<Result<void>> {
        const attribute = await this.attributeController.getAttributeByName(request.name);
        if (!attribute) {
            return Result.fail(RuntimeErrors.general.recordNotFound(ConsumptionAttribute));
        }

        await this.attributeController.deleteAttribute(attribute);
        await this.accountController.syncDatawallet();

        return Result.ok(undefined);
    }
}
