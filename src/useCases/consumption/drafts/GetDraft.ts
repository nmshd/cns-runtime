import { Result } from "@js-soft/ts-utils";
import { Draft, DraftsController } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { DraftDTO } from "../../../types";
import { RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { DraftMapper } from "./DraftMapper";

export interface GetDraftRequest {
    id: string;
}

class GetDraftRequestValidator extends RuntimeValidator<GetDraftRequest> {
    public constructor() {
        super();
    }
}

export class GetDraftUseCase extends UseCase<GetDraftRequest, DraftDTO> {
    public constructor(@Inject private readonly draftController: DraftsController, @Inject validator: GetDraftRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetDraftRequest): Promise<Result<DraftDTO>> {
        const draft = await this.draftController.getDraft(CoreId.from(request.id));
        if (!draft) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Draft));
        }

        return Result.ok(DraftMapper.toDraftDTO(draft));
    }
}
