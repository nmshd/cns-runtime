import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, IGetRelationshipAttributesParams } from "@nmshd/consumption";
import { IRelationshipAttributeQuery, RelationshipAttributeQueryJSON } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface ExecuteRelationshipAttributeQueryRequest {
    query: IRelationshipAttributeQuery | RelationshipAttributeQueryJSON;
}

export class ExecuteRelationshipAttributeQueryUseCase extends UseCase<ExecuteRelationshipAttributeQueryRequest, ConsumptionAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController) {
        super();
    }

    protected async executeInternal(request: ExecuteRelationshipAttributeQueryRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        const params = {
            query: request.query
        } as IGetRelationshipAttributesParams;
        const attributes = await this.attributeController.executeRelationshipAttributeQuery(params);
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
