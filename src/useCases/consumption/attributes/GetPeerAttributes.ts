import { Result } from "@js-soft/ts-utils";
import { LocalAttributesController } from "@nmshd/consumption";
import { RelationshipAttributeConfidentiality } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { LocalAttributeDTO } from "../../../types";
import { UseCase } from "../../common";
import { flattenObject } from "../requests/flattenObject";
import { AttributeMapper } from "./AttributeMapper";
import { GetAttributesRequestQuery, GetAttributesUseCase } from "./GetAttributes";

export interface GetPeerAttributesRequest {
    peer: string;
    onlyIdentityAttributes?: boolean;
    onlyValid?: boolean;
    query?: GetPeerAttributesRequestQuery;
}

export interface GetPeerAttributesRequestQuery {
    createdAt?: string;
    content?: {
        "@type"?: string;
        tags?: string[];
        validFrom?: string;
        validTo?: string;
        key?: string;
        isTechnical?: boolean;
        confidentiality?: RelationshipAttributeConfidentiality;
        value?: {
            "@type"?: string;
        };
    };
    shareInfo?: {
        requestReference?: string;
    };
    [key: string]: unknown;
}

export class GetPeerAttributesUseCase extends UseCase<GetPeerAttributesRequest, LocalAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: LocalAttributesController) {
        super();
    }

    protected async executeInternal(request: GetPeerAttributesRequest): Promise<Result<LocalAttributeDTO[]>> {
        const query: GetAttributesRequestQuery = { ...request.query };
        if (!query.content) query.content = {};
        query.content.owner = request.peer;
        if (request.onlyIdentityAttributes) {
            query.content["@type"] = "IdentityAttribute";
        }

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
