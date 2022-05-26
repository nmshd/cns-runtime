import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, ConsumptionIds, ISucceedConsumptionAttributeParams } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { DateValidator, IdValidator, RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface SucceedAttributeRequest {
    params: ISucceedConsumptionAttributeParams;
}

class SucceedAttributeRequestValidator extends RuntimeValidator<SucceedAttributeRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.params.successorContent.validFrom?.toString()).fulfills(DateValidator.optional());
        this.validateIf((x) => x.params.successorContent.value).isDefined();
        this.validateIf((x) => x.params.succeeds.toString()).fulfills(IdValidator.required(ConsumptionIds.attribute));
    }
}

export class SucceedAttributeUseCase extends UseCase<SucceedAttributeRequest, ConsumptionAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: ConsumptionAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: SucceedAttributeRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: SucceedAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const successor = await this.attributeController.succeedConsumptionAttribute(request.params);

        await this.accountController.syncDatawallet();

        return Result.ok(AttributeMapper.toAttributeDTO(successor));
    }
}
