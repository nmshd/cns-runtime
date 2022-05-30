import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttribute, ConsumptionAttributesController, ConsumptionIds, UpdateConsumptionAttributeParams } from "@nmshd/consumption";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface UpdateAttributeRequest {
    params: UpdateConsumptionAttributeParams;
}

class UpdateAttributeRequestValidator extends RuntimeValidator<UpdateAttributeRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.params.id.toString()).fulfills(IdValidator.required(ConsumptionIds.attribute));
        this.validateIf((x) => x.params.content).isDefined();
        this.validateIf((x) => x.params.content.value).isNotEmpty();
    }
}

export class UpdateAttributeUseCase extends UseCase<UpdateAttributeRequest, ConsumptionAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: ConsumptionAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: UpdateAttributeRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: UpdateAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const attribute = await this.attributeController.getConsumptionAttribute(CoreId.from(request.params.id));
        if (!attribute) {
            return Result.fail(RuntimeErrors.general.recordNotFound(ConsumptionAttribute));
        }
        attribute.content = request.params.content;
        const updated = await this.attributeController.updateConsumptionAttribute(attribute);
        await this.accountController.syncDatawallet();
        return Result.ok(AttributeMapper.toAttributeDTO(updated));
    }
}
