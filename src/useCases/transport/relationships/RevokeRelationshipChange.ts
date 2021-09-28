import { Result } from "@js-soft/ts-utils";
import { AccountController, BackboneIds, CoreId, Relationship, RelationshipChange, RelationshipsController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RelationshipDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { RelationshipMapper } from "./RelationshipMapper";

export interface RevokeRelationshipChangeRequest {
    relationshipId: string;
    changeId: string;
    content: any;
}

class RevokeRelationshipChangeRequestValidator extends RuntimeValidator<RevokeRelationshipChangeRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.relationshipId).fulfills(IdValidator.required(BackboneIds.relationship));
        this.validateIfString((x) => x.changeId).fulfills(IdValidator.required(BackboneIds.relationshipChange));
    }
}

export class RevokeRelationshipChangeUseCase extends UseCase<RevokeRelationshipChangeRequest, RelationshipDTO> {
    public constructor(
        @Inject private readonly relationshipsController: RelationshipsController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: RevokeRelationshipChangeRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: RevokeRelationshipChangeRequest): Promise<Result<RelationshipDTO>> {
        const relationship = await this.relationshipsController.getRelationship(CoreId.from(request.relationshipId));
        if (!relationship) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Relationship));
        }

        if (!relationship.cache) {
            return Result.fail(RuntimeErrors.general.cacheEmpty(Relationship, relationship.id.toString()));
        }

        const change = relationship.cache.changes.find((c) => c.id.toString() === request.changeId);
        if (!change) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipChange));
        }

        const res = await this.relationshipsController.revokeChange(change, request.content);

        await this.accountController.syncDatawallet();

        return Result.ok(RelationshipMapper.toRelationshipDTO(res));
    }
}
