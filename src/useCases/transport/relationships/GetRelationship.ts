import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreId, Relationship, RelationshipsController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RelationshipDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { RelationshipMapper } from "./RelationshipMapper";

export interface GetRelationshipRequest {
    id: string;
}

class GetRelationshipRequestValidator extends RuntimeValidator<GetRelationshipRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(BackboneIds.relationship));
    }
}

export class GetRelationshipUseCase extends UseCase<GetRelationshipRequest, RelationshipDTO> {
    public constructor(@Inject private readonly relationshipsController: RelationshipsController, @Inject validator: GetRelationshipRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetRelationshipRequest): Promise<Result<RelationshipDTO>> {
        const relationship = await this.relationshipsController.getRelationship(CoreId.from(request.id));
        if (!relationship) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Relationship));
        }

        return Result.ok(RelationshipMapper.toRelationshipDTO(relationship));
    }
}
