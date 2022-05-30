import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, IGetIdentityAttributesParams } from "@nmshd/consumption";
import { Attribute } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface ExecuteIdentityAttributeQueryRequest {
    params: IGetIdentityAttributesParams;
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
        const attributes = await this.attributeController.executeIdentityAttributeQuery(request.params);
        if (!attributes) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Attribute));
        }

        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
