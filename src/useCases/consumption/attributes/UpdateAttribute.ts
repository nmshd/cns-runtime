import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttribute, ConsumptionAttributesController, ConsumptionIds } from "@nmshd/consumption";
import { Attribute, IAttribute } from "@nmshd/content";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface UpdateAttributeRequest {
    id: string;
    attribute: IAttribute;
}

class UpdateAttributeRequestValidator extends RuntimeValidator<UpdateAttributeRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.attribute));
        this.validateIf((x) => x.attribute).isDefined();
        this.validateIf((x) => x.attribute.name).isNotEmpty();
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
        const attribute = await this.attributeController.getAttribute(CoreId.from(request.id));
        if (!attribute) {
            return Result.fail(RuntimeErrors.general.recordNotFound(ConsumptionAttribute));
        }

        attribute.content = Attribute.from(request.attribute);
        const updated = await this.attributeController.updateAttribute(attribute);

        await this.accountController.syncDatawallet();

        return Result.ok(AttributeMapper.toAttributeDTO(updated));
    }
}
