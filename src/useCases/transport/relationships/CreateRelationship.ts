import { Result } from "@js-soft/ts-utils";
import { AccountController, BackboneIds, CoreId, RelationshipsController, RelationshipTemplate, RelationshipTemplateController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RelationshipDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { RelationshipMapper } from "./RelationshipMapper";

export interface CreateRelationshipRequest {
    templateId: string;
    content: any;
}

class CreateRelationshipRequestValidator extends RuntimeValidator<CreateRelationshipRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.templateId).fulfills(IdValidator.required(BackboneIds.relationshipTemplate));
        this.validateIf((x) => x.content).isDefined();
    }
}

export class CreateRelationshipUseCase extends UseCase<CreateRelationshipRequest, RelationshipDTO> {
    public constructor(
        @Inject private readonly relationshipsController: RelationshipsController,
        @Inject private readonly relationshipTemplateController: RelationshipTemplateController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateRelationshipRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateRelationshipRequest): Promise<Result<RelationshipDTO>> {
        const template = await this.relationshipTemplateController.getRelationshipTemplate(CoreId.from(request.templateId));
        if (!template) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipTemplate));
        }

        const relationship = await this.relationshipsController.sendRelationship({
            template: template,
            content: request.content
        });

        await this.accountController.syncDatawallet();

        return Result.ok(RelationshipMapper.toRelationshipDTO(relationship));
    }
}
