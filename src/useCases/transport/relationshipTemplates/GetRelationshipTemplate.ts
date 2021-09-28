import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreId, RelationshipTemplate, RelationshipTemplateController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RelationshipTemplateDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { RelationshipTemplateMapper } from "./RelationshipTemplateMapper";

export interface GetRelationshipTemplateRequest {
    id: string;
}

class GetRelationshipTemplateRequestValidator extends RuntimeValidator<GetRelationshipTemplateRequest> {
    public constructor() {
        super();
        this.validateIfString((x) => x.id).fulfills(IdValidator.required(BackboneIds.relationshipTemplate));
    }
}

export class GetRelationshipTemplateUseCase extends UseCase<GetRelationshipTemplateRequest, RelationshipTemplateDTO> {
    public constructor(@Inject private readonly relationshipTemplateController: RelationshipTemplateController, @Inject validator: GetRelationshipTemplateRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetRelationshipTemplateRequest): Promise<Result<RelationshipTemplateDTO>> {
        const template = await this.relationshipTemplateController.getRelationshipTemplate(CoreId.from(request.id));
        if (!template) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipTemplate));
        }

        return Result.ok(RelationshipTemplateMapper.toRelationshipTemplateDTO(template));
    }
}
