import { Result } from "@js-soft/ts-utils";
import { RelationshipInfo, RelationshipInfoController } from "@nmshd/consumption";
import { AccountController, BackboneIds, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IdValidator, RuntimeValidator } from "../../common";
import { RuntimeErrors } from "../../common/RuntimeErrors";
import { UseCase } from "../../common/UseCase";

export interface DeleteRelationshipInfoByRelationshipRequest {
    relationshipId: string;
}

class DeleteRelationshipInfoByRelationshipRequestValidator extends RuntimeValidator<DeleteRelationshipInfoByRelationshipRequest> {
    public constructor() {
        super();

        this.validateIfAny((x) => x.relationshipId).fulfills(IdValidator.required(BackboneIds.relationship));
    }
}

export class DeleteRelationshipInfoByRelationshipUseCase extends UseCase<DeleteRelationshipInfoByRelationshipRequest, void> {
    public constructor(
        @Inject private readonly relationshipInfoController: RelationshipInfoController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: DeleteRelationshipInfoByRelationshipRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: DeleteRelationshipInfoByRelationshipRequest): Promise<Result<void>> {
        const relationshipInfo = await this.relationshipInfoController.getRelationshipInfoByRelationship(CoreId.from(request.relationshipId));
        if (!relationshipInfo) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipInfo));
        }

        await this.relationshipInfoController.deleteRelationshipInfo(relationshipInfo);
        await this.accountController.syncDatawallet();
        return Result.ok(undefined);
    }
}
