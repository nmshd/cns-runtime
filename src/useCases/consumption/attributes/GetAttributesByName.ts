import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController } from "@nmshd/consumption";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface GetAttributesByNameRequest {}

class GetAttributesByNameRequestValidator extends RuntimeValidator<GetAttributesByNameRequest> {
    public constructor() {
        super();
    }
}

export type GetAttributesByNameResponse = Record<string, ConsumptionAttributeDTO>;

export class GetAttributesByNameUseCase extends UseCase<GetAttributesByNameRequest, GetAttributesByNameResponse> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: GetAttributesByNameRequestValidator) {
        super(validator);
    }

    protected async executeInternal(_request: GetAttributesByNameRequest): Promise<Result<GetAttributesByNameResponse>> {
        const attributes = await this.attributeController.getAttributesByName();
        return Result.ok(AttributeMapper.toGetAttributesByNameResponse(attributes));
    }
}
