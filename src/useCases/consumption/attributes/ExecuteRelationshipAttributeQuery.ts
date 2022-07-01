import { Result } from "@js-soft/ts-utils";
import { IGetRelationshipAttributesParams, LocalAttributesController } from "@nmshd/consumption";
import { IRelationshipAttributeQuery, RelationshipAttributeQueryJSON } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { LocalAttributeDTO } from "../../../types";
import { UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface ExecuteRelationshipAttributeQueryRequest {
    query: IRelationshipAttributeQuery | RelationshipAttributeQueryJSON;
}

export class ExecuteRelationshipAttributeQueryUseCase extends UseCase<ExecuteRelationshipAttributeQueryRequest, LocalAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: LocalAttributesController) {
        super();
    }

    protected async executeInternal(request: ExecuteRelationshipAttributeQueryRequest): Promise<Result<LocalAttributeDTO[]>> {
        const params = {
            query: request.query
        } as IGetRelationshipAttributesParams;
        const attributes = await this.attributeController.executeRelationshipAttributeQuery(params);
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
