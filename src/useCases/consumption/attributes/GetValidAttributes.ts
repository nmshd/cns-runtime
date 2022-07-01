import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { LocalAttribute, LocalAttributesController, LocalAttributeShareInfoJSON } from "@nmshd/consumption";
import { AbstractAttributeJSON, IdentityAttribute, IdentityAttributeJSON, RelationshipAttributeConfidentiality, RelationshipAttributeJSON } from "@nmshd/content";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { LocalAttributeDTO } from "../../../types";
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

export class GetValidAttributesUseCase extends UseCase<GetValidAttributesRequest, LocalAttributeDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<LocalAttributeDTO>((x) => x.succeeds)]: true,
            [nameof<LocalAttributeDTO>((x) => x.succeededBy)]: true,

            // content.abstractAttribute
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
            [`${nameof<LocalAttributeDTO>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.peer)}`]: true,
            [`${nameof<LocalAttributeDTO>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.requestReference)}`]: true,
            [`${nameof<LocalAttributeDTO>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfoJSON>((x) => x.sourceAttribute)}`]: true
        },
        alias: {
            [nameof<LocalAttributeDTO>((x) => x.succeeds)]: [nameof<LocalAttribute>((x) => x.succeeds)],
            [nameof<LocalAttributeDTO>((x) => x.succeededBy)]: [nameof<LocalAttribute>((x) => x.succeededBy)],

            // content.abstractAttribute
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

    protected async executeInternal(request: GetValidAttributesRequest): Promise<Result<LocalAttributeDTO[]>> {
        const flattenedQuery = flattenObject(request.query);
        const dbQuery = GetValidAttributesUseCase.queryTranslator.parse(flattenedQuery);
        const attributes = await this.attributeController.getValidLocalAttributes(dbQuery);
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
