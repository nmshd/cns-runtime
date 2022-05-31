import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttribute, ConsumptionAttributesController, ConsumptionAttributeShareInfoJSON } from "@nmshd/consumption";
import {
    AbstractAttributeJSON,
    AbstractAttributeValueJSON,
    IdentityAttribute,
    IdentityAttributeJSON,
    RelationshipAttributeConfidentiality,
    RelationshipAttributeJSON
} from "@nmshd/content";
import { DateTime } from "luxon";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { flattenObject } from "../requests/flattenObject";
import { AttributeMapper } from "./AttributeMapper";

export interface GetAttributesRequest {
    query: ConsumptionAttributeQuery;
}

export interface ConsumptionAttributeQuery {
    createdAt?: string;
    content?: {
        "@type"?: string;
        tags?: string[];
        owner?: string;
        validFrom?: string;
        validTo?: string;
        key?: string;
        isTechnical?: boolean;
        confidenttiality?: RelationshipAttributeConfidentiality;
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

class Validator extends SchemaValidator<GetAttributesRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("GetAttributesRequest"));
    }
}

export class GetAttributesUseCase extends UseCase<GetAttributesRequest, ConsumptionAttributeDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<ConsumptionAttributeDTO>((x) => x.createdAt)]: true,
            [nameof<ConsumptionAttributeDTO>((x) => x.succeeds)]: true,
            [nameof<ConsumptionAttributeDTO>((x) => x.succeededBy)]: true,

            // content.abstractAttribute
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validFrom)}`]: true,
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validTo)}`]: true,
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.owner)}`]: true,
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x["@type"])}`]: true,

            // content.identityAttribute
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.tags)}`]: true,
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.value)}.${nameof<AbstractAttributeValueJSON>((x) => x["@type"])}`]:
                true,

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
            [nameof<ConsumptionAttributeDTO>((x) => x.createdAt)]: [nameof<ConsumptionAttribute>((x) => x.createdAt)],
            [nameof<ConsumptionAttributeDTO>((x) => x.succeeds)]: [nameof<ConsumptionAttribute>((x) => x.succeeds)],
            [nameof<ConsumptionAttributeDTO>((x) => x.succeededBy)]: [nameof<ConsumptionAttribute>((x) => x.succeededBy)],

            // content.abstractAttribute
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validFrom)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validFrom)}`
            ],
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validTo)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validTo)}`
            ],
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.owner)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.owner)}`
            ],
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x["@type"])}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x["@type"])}`
            ],

            // content.identityAttribute
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.tags)}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.tags)}`
            ],
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.value)}.${nameof<AbstractAttributeValueJSON>((x) => x["@type"])}`]: [
                `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.value)}.${nameof<AbstractAttributeValueJSON>((x) => x["@type"])}`
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
            // content.validFrom
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validFrom)}`]: (query: any, input: any) => {
                if (!input) {
                    return;
                }
                const validFromUtcString = DateTime.fromISO(input).toUTC().toString();
                query[`${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validFrom)}`] = {
                    $gte: validFromUtcString
                };
            },
            // content.validTo
            [`${nameof<ConsumptionAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validTo)}`]: (query: any, input: any) => {
                if (!input) {
                    return;
                }
                const validToUtcString = DateTime.fromISO(input).toUTC().toString();
                query[`${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validTo)}`] = {
                    $lte: validToUtcString
                };
            },
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

    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: Validator) {
        super(validator);
    }

    protected async executeInternal(request: GetAttributesRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        const flattenedQuery = flattenObject(request.query);
        const dbQuery = GetAttributesUseCase.queryTranslator.parse(flattenedQuery);
        const fetched = await this.attributeController.getConsumptionAttributes(dbQuery);
        return Result.ok(AttributeMapper.toAttributeDTOList(fetched));
    }
}
