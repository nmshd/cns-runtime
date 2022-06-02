import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttribute, ConsumptionAttributesController, ConsumptionAttributeShareInfoJSON } from "@nmshd/consumption";
import { AbstractAttributeJSON, IdentityAttribute, IdentityAttributeJSON, RelationshipAttributeConfidentiality, RelationshipAttributeJSON } from "@nmshd/content";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { UseCase } from "../../common";
import { flattenObject } from "../requests/flattenObject";
import { AttributeMapper } from "./AttributeMapper";

export interface GetValidAttributesRequest {
    query?: GetValidAttributesRequestQuery;
}

export interface GetValidAttributesRequestQuery {
    content?: {
        "@type"?: string;
        tags?: string[];
        owner?: string;
        key?: string;
        isTechnical?: boolean;
        confidentiality?: RelationshipAttributeConfidentiality;
        value?: {
            "@type"?: string;
        };
    };
    succeeds?: string;
    succeededBy?: string;
    shareInfo?: {
        requestReference?: string;
        peer?: string;
        sourceAttribute?: string;
    };
    [key: string]: unknown;
}

export class GetValidAttributesUseCase extends UseCase<GetValidAttributesRequest, ConsumptionAttributeDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<ConsumptionAttributeDTO>((x) => x.succeeds)]: true,
            [nameof<ConsumptionAttributeDTO>((x) => x.succeededBy)]: true,

            // content.abstractAttribute
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.owner)}`]: true,
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.@type`]: true,

            // content.identityAttribute
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.tags)}`]: true,
            [`${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.value)}.@type`]: true,

            // content.relationshipAttribute
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.key)}`]: true,
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.isTechnical)}`]: true,
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.confidentiality)}`]: true,

            // content.shareInfo
            [`${nameof<ConsumptionAttributeDTO>((x) => x.shareInfo)}.${nameof<ConsumptionAttributeShareInfoJSON>((x) => x.peer)}`]: true,
            [`${nameof<ConsumptionAttributeDTO>((x) => x.shareInfo)}.${nameof<ConsumptionAttributeShareInfoJSON>((x) => x.requestReference)}`]: true,
            [`${nameof<ConsumptionAttributeDTO>((x) => x.shareInfo)}.${nameof<ConsumptionAttributeShareInfoJSON>((x) => x.sourceAttribute)}`]: true
        },
        alias: {
            [nameof<ConsumptionAttributeDTO>((x) => x.succeeds)]: [nameof<ConsumptionAttribute>((x) => x.succeeds)],
            [nameof<ConsumptionAttributeDTO>((x) => x.succeededBy)]: [nameof<ConsumptionAttribute>((x) => x.succeededBy)],

            // content.abstractAttribute
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.owner)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.owner)}`
            ],
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.@type`]: [`${nameof<ConsumptionAttribute>((x) => x.content)}.@type`],

            // content.identityAttribute
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.tags)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.tags)}`
            ],
            [`${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.value)}.@type`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.value)}.@type`
            ],

            // content.relationshipAttribute
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.key)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.key)}`
            ],
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.isTechnical)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.isTechnical)}`
            ],
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.confidentiality)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.confidentiality)}`
            ],

            // content.shareInfo
            [`${nameof<ConsumptionAttributeDTO>((x) => x.shareInfo)}.${nameof<ConsumptionAttributeShareInfoJSON>((x) => x.peer)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.shareInfo)}.${nameof<ConsumptionAttributeShareInfoJSON>((x) => x.peer)}`
            ],
            [`${nameof<ConsumptionAttributeDTO>((x) => x.shareInfo)}.${nameof<ConsumptionAttributeShareInfoJSON>((x) => x.requestReference)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.shareInfo)}.${nameof<ConsumptionAttributeShareInfoJSON>((x) => x.requestReference)}`
            ],
            [`${nameof<ConsumptionAttributeDTO>((x) => x.shareInfo)}.${nameof<ConsumptionAttributeShareInfoJSON>((x) => x.sourceAttribute)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.shareInfo)}.${nameof<ConsumptionAttributeShareInfoJSON>((x) => x.sourceAttribute)}`
            ]
        },
        custom: {
            // content.tags
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<IdentityAttribute>((x) => x.tags)}`]: (query: any, input: any) => {
                const allowedTags = [];
                for (const tag of input) {
                    const tagQuery = { [`${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.tags)}`]: { $contains: tag } };
                    allowedTags.push(tagQuery);
                }
                query["$or"] = allowedTags;
            }
        }
    });

    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController) {
        super();
    }

    protected async executeInternal(request: GetValidAttributesRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        const flattenedQuery = flattenObject(request.query);
        const dbQuery = GetValidAttributesUseCase.queryTranslator.parse(flattenedQuery);
        const attributes = await this.attributeController.getValidConsumptionAttributes(dbQuery);
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
