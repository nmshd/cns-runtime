import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, Draft, DraftsController } from "@nmshd/consumption";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";

export interface DeleteDraftRequest {
    id: string;
}

class DeleteDraftRequestValidator extends RuntimeValidator<DeleteDraftRequest> {
    public constructor() {
        super();

        this.validateIfAny((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.draft));
    }
}

export class DeleteDraftUseCase extends UseCase<DeleteDraftRequest, void> {
    public constructor(
        @Inject private readonly draftController: DraftsController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: DeleteDraftRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: DeleteDraftRequest): Promise<Result<void>> {
        const draft = await this.draftController.getDraft(CoreId.from(request.id));
        if (!draft) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Draft));
        }

        await this.draftController.deleteDraft(draft);
        await this.accountController.syncDatawallet();

        return Result.ok(undefined);
    }
}
