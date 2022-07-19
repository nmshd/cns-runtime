import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { CachedRelationship, Identity, Relationship, RelationshipsController, RelationshipTemplate } from "@nmshd/transport";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { RelationshipDTO, RelationshipTemplateDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { RelationshipMapper } from "./RelationshipMapper";

export interface GetRelationshipsQuery {
    peer?: string | string[];
    type?: string | string[];
    "template.id"?: string | string[];
}

export interface GetRelationshipsRequest {
    query?: GetRelationshipsQuery;
}

export class GetRelationshipsUseCase extends UseCase<GetRelationshipsRequest, RelationshipDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<RelationshipDTO>((r) => r.peer)]: true,
            [nameof<RelationshipDTO>((r) => r.status)]: true,
            [`${nameof<RelationshipDTO>((r) => r.template)}.${nameof<RelationshipTemplateDTO>((t) => t.id)}`]: true
        },
        alias: {
            [`${nameof<RelationshipDTO>((r) => r.template)}.${nameof<RelationshipTemplateDTO>((r) => r.id)}`]: `${nameof<Relationship>(
                (r) => r.cache
            )}.${nameof<CachedRelationship>((r) => r.template)}.${nameof<RelationshipTemplate>((r) => r.id)}`,
            [nameof<RelationshipDTO>((r) => r.status)]: nameof<Relationship>((r) => r.status),
            [nameof<RelationshipDTO>((r) => r.peer)]: `${nameof<Relationship>((r) => r.peer)}.${nameof<Identity>((r) => r.address)}`
        }
    });

    public constructor(@Inject private readonly relationshipsController: RelationshipsController, @Inject validator: RuntimeValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetRelationshipsRequest): Promise<Result<RelationshipDTO[]>> {
        const query = GetRelationshipsUseCase.queryTranslator.parse(request.query);

        const relationships = await this.relationshipsController.getRelationships(query);

        return Result.ok(RelationshipMapper.toRelationshipDTOList(relationships));
    }
}
