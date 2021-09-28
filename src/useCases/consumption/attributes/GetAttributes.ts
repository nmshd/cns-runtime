import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController } from "@nmshd/consumption";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface GetAttributesRequest {
    // TODO: JSSNMSHDD-2204 (add query for GetAttributes)
}

class GetAttributesRequestValidator extends RuntimeValidator<GetAttributesRequest> {
    public constructor() {
        super();

        // TODO: JSSNMSHDD-2465 (add validation)
    }
}

export class GetAttributesUseCase extends UseCase<GetAttributesRequest, ConsumptionAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: GetAttributesRequestValidator) {
        super(validator);
    }

    protected async executeInternal(_request: GetAttributesRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        const fetched = await this.attributeController.getAttributes();
        return Result.ok(AttributeMapper.toAttributeDTOList(fetched));
    }
}
