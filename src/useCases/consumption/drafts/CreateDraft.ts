import { Result } from "@js-soft/ts-utils";
import { DraftsController } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { DraftDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { DraftMapper } from "./DraftMapper";

export interface CreateDraftRequest {
    content: any;
    type?: string;
}

class CreateDraftRequestValidator extends RuntimeValidator<CreateDraftRequest> {
    public constructor() {
        super();
    }
}

export class CreateDraftUseCase extends UseCase<CreateDraftRequest, DraftDTO> {
    public constructor(
        @Inject private readonly draftController: DraftsController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateDraftRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateDraftRequest): Promise<Result<DraftDTO>> {
        const draft = await this.draftController.createDraft(request.content, request.type);
        await this.accountController.syncDatawallet();
        return Result.ok(DraftMapper.toDraftDTO(draft));
    }
}
