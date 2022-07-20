import { Result } from "@js-soft/ts-utils";
import { LocalAttributesController } from "@nmshd/consumption";
import { IdentityController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { LocalAttributeDTO } from "../../../types";
import { UseCase } from "../../common";
import { flattenObject } from "../requests/flattenObject";
import { AttributeMapper } from "./AttributeMapper";
import { GetAttributesRequestQuery, GetAttributesUseCase } from "./GetAttributes";

export interface GetSharedToPeerAttributesRequest {
    peer: string;
    onlyValid?: boolean;
    query?: GetSharedToPeerAttributesRequestQuery;
}

export interface GetSharedToPeerAttributesRequestQuery {
    createdAt?: string;
    "content.@type"?: string | string[];
    "content.tags"?: string | string[];
    "content.validFrom"?: string | string[];
    "content.validTo"?: string | string[];
    "content.key"?: string | string[];
    "content.isTechnical"?: string | string[];
    "content.confidentiality"?: string | string[];
    "content.value.@type"?: string | string[];
    shareInfo?: string | string[];
    "shareInfo.requestReference"?: string | string[];
    "shareInfo.sourceAttribute"?: string | string[];
}

export class GetSharedToPeerAttributesUseCase extends UseCase<GetSharedToPeerAttributesRequest, LocalAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: LocalAttributesController, @Inject private readonly identityController: IdentityController) {
        super();
    }

    protected async executeInternal(request: GetSharedToPeerAttributesRequest): Promise<Result<LocalAttributeDTO[]>> {
        const query: GetAttributesRequestQuery = request.query ?? {};
        query["content.owner"] = this.identityController.address.toString();

        query["shareInfo.peer"] = request.peer;

        const flattenedQuery = flattenObject(query);
        const dbQuery = GetAttributesUseCase.queryTranslator.parse(flattenedQuery);
        let attributes;
        if (request.onlyValid) {
            attributes = await this.attributeController.getValidLocalAttributes(dbQuery);
        } else {
            attributes = await this.attributeController.getLocalAttributes(dbQuery);
        }
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
