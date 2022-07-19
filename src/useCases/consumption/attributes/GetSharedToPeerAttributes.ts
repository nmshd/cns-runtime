import { Result } from "@js-soft/ts-utils";
import { LocalAttributesController } from "@nmshd/consumption";
import { RelationshipAttributeConfidentiality } from "@nmshd/content";
import { IdentityController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { LocalAttributeDTO } from "../../../types";
import { UseCase } from "../../common";
import { flattenObject } from "../requests/flattenObject";
import { AttributeMapper } from "./AttributeMapper";
import { GetAttributesRequestQuery, GetAttributesUseCase } from "./GetAttributes";

export interface GetSharedToPeerAttributesRequest {
    peer: string;
    onlyIdentityAttributes?: boolean;
    onlyValid?: boolean;
    query?: GetSharedToPeerAttributesRequestQuery;
}

export interface GetSharedToPeerAttributesRequestQuery {
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
        sourceAttribute?: string;
    };
    [key: string]: unknown;
}

export class GetSharedToPeerAttributesUseCase extends UseCase<GetSharedToPeerAttributesRequest, LocalAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: LocalAttributesController, @Inject private readonly identityController: IdentityController) {
        super();
    }

    protected async executeInternal(request: GetSharedToPeerAttributesRequest): Promise<Result<LocalAttributeDTO[]>> {
        const query: GetAttributesRequestQuery = { ...request.query };
        if (!query.content) query.content = {};
        query.content.owner = this.identityController.address.toString();
        if (request.onlyIdentityAttributes) {
            query.content["@type"] = "IdentityAttribute";
        }

        if (!query.shareInfo || typeof query.shareInfo === "string") query.shareInfo = {};
        query.shareInfo.peer = request.peer;

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
