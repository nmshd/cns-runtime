import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttribute, ConsumptionAttributesController } from "@nmshd/consumption";
import { ConsumptionAttributeShareInfo } from "@nmshd/consumption/dist/modules/attributes/local/ConsumptionAttributeShareInfo";
import {
    AbstractAttribute,
    AbstractAttributeQuery,
    AbstractAttributeValueJSON,
    IdentityAttribute,
    IdentityAttributeQuery,
    IIdentityAttributeQuery,
    IRelationshipAttributeQuery,
    RelationshipAttribute,
    RelationshipAttributeQuery
} from "@nmshd/content";
import { DateTime } from "luxon";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface GetAttributesRequest {
    query: IIdentityAttributeQuery | IRelationshipAttributeQuery;
}

class GetAttributesRequestValidator extends RuntimeValidator<GetAttributesRequest> {
    public constructor() {
        super();
    }
}

export class GetAttributesUseCase extends UseCase<GetAttributesRequest, ConsumptionAttributeDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<AbstractAttributeQuery>((c) => c.valueType)]: true,
            [nameof<AbstractAttributeQuery>((c) => c.validFrom)]: true,
            [nameof<AbstractAttributeQuery>((c) => c.validTo)]: true,
            [nameof<IdentityAttributeQuery>((c) => c.tags)]: true,
            [nameof<RelationshipAttributeQuery>((c) => c.key)]: true,
            [nameof<RelationshipAttributeQuery>((c) => c.owner)]: true,
            [nameof<RelationshipAttributeQuery>((c) => c.thirdParty)]: true,
            [nameof<RelationshipAttributeQuery>((c) => c.attributeHints)]: true
        },
        alias: {
            [nameof<AbstractAttributeQuery>((c) => c.valueType)]: `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<IdentityAttribute>(
                (x) => x.value
            )}.${nameof<AbstractAttributeValueJSON>((x) => x["@type"])}`,
            [nameof<AbstractAttributeQuery>((c) => c.validFrom)]: `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<AbstractAttribute>((x) => x.validFrom)}`,
            [nameof<AbstractAttributeQuery>((c) => c.validTo)]: `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<AbstractAttribute>((x) => x.validTo)}`,
            // [nameof<IdentityAttributeQuery>((c) => c.tags)]: `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<IdentityAttribute>((x) => x.tags)}`,
            [nameof<RelationshipAttributeQuery>((c) => c.key)]: `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<RelationshipAttribute>((x) => x.key)}`,
            [nameof<RelationshipAttributeQuery>((x) => x.owner)]: `${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<RelationshipAttribute>((x) => x.owner)}`,
            [nameof<RelationshipAttributeQuery>((x) => x.thirdParty)]: `${nameof<ConsumptionAttribute>((x) => x.shareInfo)}.${nameof<ConsumptionAttributeShareInfo>((x) => x.peer)}`
        },
        custom: {
            // validFrom
            [nameof<AbstractAttributeQuery>((c) => c.validFrom)]: (query: any, input: any) => {
                if (!input) {
                    return;
                }
                const validFromUtcString = DateTime.fromISO(input).toUTC().toString();
                query["validFrom"] = {
                    $gte: validFromUtcString
                };
            },
            // validTo
            [nameof<AbstractAttributeQuery>((c) => c.validTo)]: (query: any, input: any) => {
                if (!input) {
                    return;
                }
                const validToUtcString = DateTime.fromISO(input).toUTC().toString();
                query["validTO"] = {
                    $lte: validToUtcString
                };
            },
            // tags
            [nameof<IdentityAttributeQuery>((c) => c.tags)]: (query: any, input: any) => {
                const allowedTags = [];
                for (const tag of input) {
                    const tagQuery = { [`${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<IdentityAttribute>((x) => x.tags)}`]: { $contains: tag } };
                    allowedTags.push(tagQuery);
                }
                query["$or"] = allowedTags;
            }
        }
    });

    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: GetAttributesRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetAttributesRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        const fetched = await this.attributeController.getConsumptionAttributes(request.query);
        return Result.ok(AttributeMapper.toAttributeDTOList(fetched));
    }
}
