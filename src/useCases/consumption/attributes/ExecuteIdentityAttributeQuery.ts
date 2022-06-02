import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, IGetIdentityAttributesParams } from "@nmshd/consumption";
import { IdentityAttributeQueryJSON, IIdentityAttributeQuery } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface ExecuteIdentityAttributeQueryRequest {
    query: IIdentityAttributeQuery | IdentityAttributeQueryJSON;
}

export class ExecuteIdentityAttributeQueryUseCase extends UseCase<ExecuteIdentityAttributeQueryRequest, ConsumptionAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController) {
        super();
    }

    protected async executeInternal(request: ExecuteIdentityAttributeQueryRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        const params = {
            query: request.query
        } as IGetIdentityAttributesParams;
        const attributes = await this.attributeController.executeIdentityAttributeQuery(params);
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
