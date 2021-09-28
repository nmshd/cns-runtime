import { Result } from "@js-soft/ts-utils";
import { RelationshipInfo, RelationshipInfoController } from "@nmshd/consumption";
import { BackboneIds, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RelationshipInfoDTO } from "../../../types";
import { IdValidator, RuntimeValidator } from "../../common";
import { RuntimeErrors } from "../../common/RuntimeErrors";
import { UseCase } from "../../common/UseCase";
import { RelationshipInfoMapper } from "./RelationshipInfoMapper";

export interface GetRelationshipInfoByRelationshipRequest {
    relationshipId: string;
}

class GetRelationshipInfoRequestValidator extends RuntimeValidator<GetRelationshipInfoByRelationshipRequest> {
    public constructor() {
        super();

        this.validateIfAny((x) => x.relationshipId).fulfills(IdValidator.required(BackboneIds.relationship));
    }
}

export class GetRelationshipInfoByRelationshipUseCase extends UseCase<GetRelationshipInfoByRelationshipRequest, RelationshipInfoDTO> {
    public constructor(@Inject private readonly relationshipInfoController: RelationshipInfoController, @Inject validator: GetRelationshipInfoRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetRelationshipInfoByRelationshipRequest): Promise<Result<RelationshipInfoDTO>> {
        const relationshipInfo = await this.relationshipInfoController.getRelationshipInfoByRelationship(CoreId.from(request.relationshipId));
        if (!relationshipInfo) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipInfo));
        }
        return Result.ok(RelationshipInfoMapper.toRelationshipInfoDTO(relationshipInfo));
    }
}
