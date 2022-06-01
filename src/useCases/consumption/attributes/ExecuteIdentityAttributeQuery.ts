import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, IGetIdentityAttributesParams } from "@nmshd/consumption";
import { IIdentityAttributeQuery } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface ExecuteIdentityAttributeQueryRequest {
    query: IIdentityAttributeQuery;
}

export class ExecuteIdentityAttributeQueryUseCase extends UseCase<ExecuteIdentityAttributeQueryRequest, ConsumptionAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: ExecuteIdentityAttributeQueryValidator) {
        super();
    }

    protected async executeInternal(request: ExecuteIdentityAttributeQueryRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        const params: IGetIdentityAttributesParams = {
            query: request.query
        };
        const attributes = await this.attributeController.executeIdentityAttributeQuery(params);
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
