import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController } from "@nmshd/consumption";
import { Attribute } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface GetAttributeByNameRequest {
    name: string;
}

class GetAttributeByNameRequestValidator extends RuntimeValidator<GetAttributeByNameRequest> {
    public constructor() {
        super();

        this.validateIfString((d) => d.name).isNotEmpty();
    }
}

export class GetAttributeByNameUseCase extends UseCase<GetAttributeByNameRequest, ConsumptionAttributeDTO> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: GetAttributeByNameRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetAttributeByNameRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const attribute = await this.attributeController.getAttributeByName(request.name);
        if (!attribute) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Attribute));
        }

        return Result.ok(AttributeMapper.toAttributeDTO(attribute));
    }
}
