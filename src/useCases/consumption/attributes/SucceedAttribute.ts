import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttribute, ConsumptionAttributesController } from "@nmshd/consumption";
import { IAttribute } from "@nmshd/content";
import { AccountController, CoreDate } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { DateValidator, RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface SucceedAttributeRequest {
    attribute: IAttribute;
    validFrom?: string;
}

class SucceedAttributeRequestValidator extends RuntimeValidator<SucceedAttributeRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.validFrom).fulfills(DateValidator.optional());
        this.validateIf((x) => x.attribute).isDefined();
        this.validateIf((x) => x.attribute.name).isNotEmpty();
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
        const attribute = await ConsumptionAttribute.fromAttribute(request.attribute);
        const successor = await this.attributeController.succeedAttribute(attribute, request.validFrom ? CoreDate.from(request.validFrom) : undefined);

        await this.accountController.syncDatawallet();

        return Result.ok(AttributeMapper.toAttributeDTO(successor));
    }
}
