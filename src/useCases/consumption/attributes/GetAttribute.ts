import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, ConsumptionIds } from "@nmshd/consumption";
import { Attribute } from "@nmshd/content";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface GetAttributeRequest {
    id: string;
}

class GetAttributeRequestValidator extends RuntimeValidator<GetAttributeRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.attribute));
    }
}

export class GetAttributeUseCase extends UseCase<GetAttributeRequest, ConsumptionAttributeDTO> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: GetAttributeRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const attribute = await this.attributeController.getConsumptionAttribute(CoreId.from(request.id));
        if (!attribute) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Attribute));
        }

        return Result.ok(AttributeMapper.toAttributeDTO(attribute));
    }
}
