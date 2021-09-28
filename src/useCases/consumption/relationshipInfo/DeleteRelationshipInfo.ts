import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, RelationshipInfo, RelationshipInfoController } from "@nmshd/consumption";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IdValidator, RuntimeValidator } from "../../common";
import { RuntimeErrors } from "../../common/RuntimeErrors";
import { UseCase } from "../../common/UseCase";

export interface DeleteRelationshipInfoRequest {
    id: string;
}

class DeleteRelationshipInfoRequestValidator extends RuntimeValidator<DeleteRelationshipInfoRequest> {
    public constructor() {
        super();

        this.validateIfAny((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.relationshipInfo));
    }
}

export class DeleteRelationshipInfoUseCase extends UseCase<DeleteRelationshipInfoRequest, void> {
    public constructor(
        @Inject private readonly relationshipInfoController: RelationshipInfoController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: DeleteRelationshipInfoRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: DeleteRelationshipInfoRequest): Promise<Result<void>> {
        const relationshipInfo = await this.relationshipInfoController.getRelationshipInfo(CoreId.from(request.id));
        if (!relationshipInfo) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipInfo));
        }

        await this.relationshipInfoController.deleteRelationshipInfo(relationshipInfo);
        await this.accountController.syncDatawallet();
        return Result.ok(undefined);
    }
}
