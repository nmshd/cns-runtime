import { Result } from "@js-soft/ts-utils";
import { IGetIdentityAttributesParams, LocalAttributesController } from "@nmshd/consumption";
import { IdentityAttributeQueryJSON, IIdentityAttributeQuery } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { LocalAttributeDTO } from "../../../types";
import { UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface ExecuteIdentityAttributeQueryRequest {
    query: IIdentityAttributeQuery | IdentityAttributeQueryJSON;
}

export class ExecuteIdentityAttributeQueryUseCase extends UseCase<ExecuteIdentityAttributeQueryRequest, LocalAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: LocalAttributesController) {
        super();
    }

    protected async executeInternal(request: ExecuteIdentityAttributeQueryRequest): Promise<Result<LocalAttributeDTO[]>> {
        const params = {
            query: request.query
        } as IGetIdentityAttributesParams;
        const attributes = await this.attributeController.executeIdentityAttributeQuery(params);
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
