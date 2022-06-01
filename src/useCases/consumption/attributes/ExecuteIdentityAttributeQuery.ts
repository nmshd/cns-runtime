import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, IGetIdentityAttributesParams } from "@nmshd/consumption";
import { IIdentityAttributeQuery } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface ExecuteIdentityAttributeQueryRequest {
    query: IIdentityAttributeQuery;
}

class ExecuteIdentityAttributeQueryValidator extends RuntimeValidator<ExecuteIdentityAttributeQueryRequest> {
    public constructor() {
        super();
    }
}

export class ExecuteIdentityAttributeQueryUseCase extends UseCase<ExecuteIdentityAttributeQueryRequest, ConsumptionAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: ExecuteIdentityAttributeQueryValidator) {
        super(validator);
    }

    protected async executeInternal(request: ExecuteIdentityAttributeQueryRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        const params: IGetIdentityAttributesParams = {
            query: request.query
        };
        const attributes = await this.attributeController.executeIdentityAttributeQuery(params);
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
