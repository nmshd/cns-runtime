import { Result } from "@js-soft/ts-utils";
import { LocalAttributesController } from "@nmshd/consumption";
import { IRelationshipAttributeQuery, RelationshipAttributeQuery, RelationshipAttributeQueryJSON } from "@nmshd/content";
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
        const attributes = await this.attributeController.executeRelationshipAttributeQuery(RelationshipAttributeQuery.from(request.query));
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
