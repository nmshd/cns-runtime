import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { LocalAttribute, LocalAttributesController, LocalAttributeShareInfoJSON } from "@nmshd/consumption";
import { AbstractAttributeJSON, IdentityAttribute, IdentityAttributeJSON, RelationshipAttributeConfidentiality, RelationshipAttributeJSON } from "@nmshd/content";
import { DateTime } from "luxon";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { LocalAttributeDTO } from "../../../types";
import { UseCase } from "../../common";
import { flattenObject } from "../requests/flattenObject";
import { AttributeMapper } from "./AttributeMapper";

export interface GetAttributesRequest {
    query?: GetAttributesRequestQuery;
}

export interface GetAttributesRequestQuery {
    createdAt?: string;
    content?: {
        "@type"?: string;
        tags?: string[];
        owner?: string;
        validFrom?: string;
        validTo?: string;
        key?: string;
        isTechnical?: boolean;
        confidentiality?: RelationshipAttributeConfidentiality;
        value?: {
            "@type"?: string;
        };
    };
    succeeds?: string;
    succeededBy?: string;
    shareInfo?:
        | {
              requestReference?: string;
              peer?: string;
              sourceAttribute?: string;
          }
        | string;
    [key: string]: unknown;
}

export class GetAttributesUseCase extends UseCase<GetAttributesRequest, LocalAttributeDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<LocalAttributeDTO>((x) => x.createdAt)]: true,
            [nameof<LocalAttributeDTO>((x) => x.succeeds)]: true,
            [nameof<LocalAttributeDTO>((x) => x.succeededBy)]: true,

            // content.abstractAttribute
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validFrom)}`]: true,
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validTo)}`]: true,
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.owner)}`]: true,
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.@type`]: true,

            // content.identityAttribute
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.tags)}`]: true,
            [`${nameof<LocalAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.value)}.@type`]: true,

            // content.relationshipAttribute
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.key)}`]: true,
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.isTechnical)}`]: true,
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.confidentiality)}`]: true,

            // content.shareInfo
            [`${nameof<LocalAttributeDTO>((x) => x.shareInfo)}`]: true,
            [`${nameof<LocalAttributeDTO>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.peer)}`]: true,
            [`${nameof<LocalAttributeDTO>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.requestReference)}`]: true,
            [`${nameof<LocalAttributeDTO>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.sourceAttribute)}`]: true
        },
        alias: {
            [nameof<LocalAttributeDTO>((x) => x.createdAt)]: [nameof<LocalAttribute>((x) => x.createdAt)],
            [nameof<LocalAttributeDTO>((x) => x.succeeds)]: [nameof<LocalAttribute>((x) => x.succeeds)],
            [nameof<LocalAttributeDTO>((x) => x.succeededBy)]: [nameof<LocalAttribute>((x) => x.succeededBy)],

            // content.abstractAttribute
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validFrom)}`]: [
                `${nameof<LocalAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validFrom)}`
            ],
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validTo)}`]: [
                `${nameof<LocalAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validTo)}`
            ],
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.owner)}`]: [
                `${nameof<LocalAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.owner)}`
            ],
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.@type`]: [`${nameof<LocalAttribute>((x) => x.content)}.@type`],

            // content.identityAttribute
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.tags)}`]: [
                `${nameof<LocalAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.tags)}`
            ],
            [`${nameof<LocalAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.value)}.@type`]: [
                `${nameof<LocalAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.value)}.@type`
            ],

            // content.relationshipAttribute
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.key)}`]: [
                `${nameof<LocalAttribute>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.key)}`
            ],
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.isTechnical)}`]: [
                `${nameof<LocalAttribute>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.isTechnical)}`
            ],
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.confidentiality)}`]: [
                `${nameof<LocalAttribute>((x) => x.content)}.${nameof<RelationshipAttributeJSON>((x) => x.confidentiality)}`
            ],

            // content.shareInfo
            [`${nameof<LocalAttributeDTO>((x) => x.shareInfo)}`]: [`${nameof<LocalAttribute>((x) => x.shareInfo)}`],
            [`${nameof<LocalAttributeDTO>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.peer)}`]: [
                `${nameof<LocalAttribute>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.peer)}`
            ],
            [`${nameof<LocalAttributeDTO>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.requestReference)}`]: [
                `${nameof<LocalAttribute>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.requestReference)}`
            ],
            [`${nameof<LocalAttributeDTO>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.sourceAttribute)}`]: [
                `${nameof<LocalAttribute>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.sourceAttribute)}`
            ]
        },
        custom: {
            // content.validFrom
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validFrom)}`]: (query: any, input: any) => {
                if (!input) {
                    return;
                }
                const validFromUtcString = DateTime.fromISO(input).toUTC().toString();
                query[`${nameof<LocalAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validFrom)}`] = {
                    $gte: validFromUtcString
                };
            },
            // content.validTo
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validTo)}`]: (query: any, input: any) => {
                if (!input) {
                    return;
                }
                const validToUtcString = DateTime.fromISO(input).toUTC().toString();
                query[`${nameof<LocalAttribute>((x) => x.content)}.${nameof<AbstractAttributeJSON>((x) => x.validTo)}`] = {
                    $lte: validToUtcString
                };
            },
            // content.tags
            [`${nameof<LocalAttributeDTO>((x) => x.content)}.${nameof<IdentityAttribute>((x) => x.tags)}`]: (query: any, input: any) => {
                const allowedTags = [];
                for (const tag of input) {
                    const tagQuery = { [`${nameof<LocalAttribute>((x) => x.content)}.${nameof<IdentityAttributeJSON>((x) => x.tags)}`]: { $contains: tag } };
                    allowedTags.push(tagQuery);
                }
                query["$or"] = allowedTags;
            }
        }
    });

    public constructor(@Inject private readonly attributeController: LocalAttributesController) {
        super();
    }

    protected async executeInternal(request: GetAttributesRequest): Promise<Result<LocalAttributeDTO[]>> {
        const flattenedQuery = flattenObject(request.query);
        const dbQuery = GetAttributesUseCase.queryTranslator.parse(flattenedQuery);
        const attributes = await this.attributeController.getLocalAttributes(dbQuery);
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
