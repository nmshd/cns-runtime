import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, GetRelationshipAttributesParams } from "@nmshd/consumption";
import { IRelationshipAttributeQuery } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface ExecuteRelationshipAttributeQueryRequest {
    query: IRelationshipAttributeQuery;
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
        const params = GetRelationshipAttributesParams.from({
            query: request.query
        });
        const attributes = await this.attributeController.executeRelationshipAttributeQuery(params);
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
