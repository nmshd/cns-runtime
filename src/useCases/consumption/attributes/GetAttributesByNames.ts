import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController } from "@nmshd/consumption";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface GetAttributesByNamesRequest {}

class GetAttributesByNamesRequestValidator extends RuntimeValidator<GetAttributesByNamesRequest> {
    public constructor() {
        super();
    }
}

export type GetAttributesByNamesResponse = Record<string, ConsumptionAttributeDTO>;

export class GetAttributesByNamesUseCase extends UseCase<GetAttributesByNamesRequest, GetAttributesByNamesResponse> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: GetAttributesByNamesRequestValidator) {
        super(validator);
    }

    protected async executeInternal(_request: GetAttributesByNamesRequest): Promise<Result<GetAttributesByNamesResponse>> {
        const attributes = await this.attributeController.getAttributesByName();
        return Result.ok(AttributeMapper.toGetAttributesByNamesResponse(attributes));
    }
}
