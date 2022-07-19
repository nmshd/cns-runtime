import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { CachedRelationshipTemplate, RelationshipTemplate, RelationshipTemplateController } from "@nmshd/transport";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { RelationshipTemplateDTO } from "../../../types";
import { OwnerRestriction, RuntimeValidator, UseCase } from "../../common";
import { RelationshipTemplateMapper } from "./RelationshipTemplateMapper";

export interface GetRelationshipTemplatesQuery {
    isOwn?: string | string[];
    createdAt?: string | string[];
    expiresAt?: string | string[];
    createdBy?: string | string[];
    createdByDevice?: string | string[];
    maxNumberOfAllocations?: string | string[];
    maxNumberOfRelationships?: string | string[];
}

export interface GetRelationshipTemplatesRequest {
    query?: any;
    ownerRestriction?: OwnerRestriction;
}

export class GetRelationshipTemplatesUseCase extends UseCase<GetRelationshipTemplatesRequest, RelationshipTemplateDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<RelationshipTemplateDTO>((r) => r.isOwn)]: true,
            [nameof<RelationshipTemplateDTO>((r) => r.createdAt)]: true,
            [nameof<RelationshipTemplateDTO>((r) => r.expiresAt)]: true,
            [nameof<RelationshipTemplateDTO>((r) => r.createdBy)]: true,
            [nameof<RelationshipTemplateDTO>((r) => r.createdByDevice)]: true,
            [nameof<RelationshipTemplateDTO>((r) => r.maxNumberOfAllocations)]: true,
            [nameof<RelationshipTemplateDTO>((r) => r.maxNumberOfRelationships)]: true
        },
        alias: {
            [nameof<RelationshipTemplateDTO>((r) => r.isOwn)]: nameof<RelationshipTemplate>((r) => r.isOwn),
            [nameof<RelationshipTemplateDTO>((r) => r.createdAt)]: `${nameof<RelationshipTemplate>((r) => r.cache)}.${nameof<CachedRelationshipTemplate>((t) => t.createdAt)}`,
            [nameof<RelationshipTemplateDTO>((r) => r.expiresAt)]: `${nameof<RelationshipTemplate>((r) => r.cache)}.${nameof<CachedRelationshipTemplate>((t) => t.expiresAt)}`,
            [nameof<RelationshipTemplateDTO>((r) => r.createdBy)]: `${nameof<RelationshipTemplate>((r) => r.cache)}.${nameof<CachedRelationshipTemplate>((t) => t.createdBy)}`,
            [nameof<RelationshipTemplateDTO>((r) => r.createdByDevice)]: `${nameof<RelationshipTemplate>((r) => r.cache)}.${nameof<CachedRelationshipTemplate>(
                (t) => t.createdByDevice
            )}`,
            [nameof<RelationshipTemplateDTO>((r) => r.maxNumberOfAllocations)]: `${nameof<RelationshipTemplate>((r) => r.cache)}.${nameof<CachedRelationshipTemplate>(
                (t) => t.maxNumberOfAllocations
            )}`,
            [nameof<RelationshipTemplateDTO>((r) => r.maxNumberOfRelationships)]: `${nameof<RelationshipTemplate>((r) => r.cache)}.${nameof<CachedRelationshipTemplate>(
                (t) => t.maxNumberOfRelationships
            )}`
        }
    });

    public constructor(@Inject private readonly relationshipTemplateController: RelationshipTemplateController, @Inject validator: RuntimeValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetRelationshipTemplatesRequest): Promise<Result<RelationshipTemplateDTO[]>> {
        const query = GetRelationshipTemplatesUseCase.queryTranslator.parse(request.query);

        if (request.ownerRestriction) {
            query[nameof<RelationshipTemplate>((t) => t.isOwn)] = request.ownerRestriction === OwnerRestriction.Own;
        }

        const relationshipTemplates = await this.relationshipTemplateController.getRelationshipTemplates(query);
        return Result.ok(RelationshipTemplateMapper.toRelationshipTemplateDTOList(relationshipTemplates));
    }
}
