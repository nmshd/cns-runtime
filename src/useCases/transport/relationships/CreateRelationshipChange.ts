import { Result } from "@js-soft/ts-utils";
import { AccountController, BackboneIds, RelationshipsController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RelationshipDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";

export interface CreateRelationshipChangeRequest {
    id: string;
    content?: any;
}

class CreateRelationshipChangeRequestValidator extends RuntimeValidator<CreateRelationshipChangeRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(BackboneIds.relationship));
        this.validateIf((x) => x.content).isDefined();
    }
}

export class CreateRelationshipChangeUseCase extends UseCase<CreateRelationshipChangeRequest, RelationshipDTO> {
    public constructor(
        @Inject private readonly relationshipsController: RelationshipsController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateRelationshipChangeRequestValidator
    ) {
        super(validator);
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    protected async executeInternal(_request: CreateRelationshipChangeRequest): Promise<Result<RelationshipDTO>> {
        return Result.fail(RuntimeErrors.general.notImplemented());
    }
}
