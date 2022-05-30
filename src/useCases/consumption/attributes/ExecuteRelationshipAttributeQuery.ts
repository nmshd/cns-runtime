import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, IGetRelationshipAttributesParams } from "@nmshd/consumption";
import { Attribute } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface ExecuteRelationshipAttributeQueryRequest {
    params: IGetRelationshipAttributesParams;
}

class ExecuteRelationshipAttributeQueryValidator extends RuntimeValidator<ExecuteRelationshipAttributeQueryRequest> {
    public constructor() {
        super();
    }
}

export class ExecuteRelationshipAttributeQueryUseCase extends UseCase<ExecuteRelationshipAttributeQueryRequest, ConsumptionAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: ExecuteRelationshipAttributeQueryValidator) {
        super(validator);
    }

    protected async executeInternal(request: ExecuteRelationshipAttributeQueryRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        const attributes = await this.attributeController.executeRelationshipAttributeQuery(request.params);
        if (!attributes) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Attribute));
        }

        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
