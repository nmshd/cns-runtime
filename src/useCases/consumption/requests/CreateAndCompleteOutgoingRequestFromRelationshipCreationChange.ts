import { ApplicationError, Result } from "@js-soft/ts-utils";
import { ICreateOutgoingRequestFromRelationshipCreationChangeParameters, OutgoingRequestsController } from "@nmshd/consumption";
import { CoreId, RelationshipChange, RelationshipsController, RelationshipTemplate, RelationshipTemplateController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { LocalRequestDTO } from "../../../types";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CreateAndCompleteOutgoingRequestFromRelationshipCreationChangeRequest {
    /**
     * @pattern RLT[A-Za-z0-9]{17}
     */
    templateId: string;
    /**
     * @pattern RCH[A-Za-z0-9]{17}
     */
    relationshipChangeId: string;
}

export class CreateAndCompleteOutgoingRequestFromRelationshipCreationChangeUseCase extends UseCase<
    CreateAndCompleteOutgoingRequestFromRelationshipCreationChangeRequest,
    LocalRequestDTO
> {
    public constructor(
        @Inject private readonly outgoingRequestsController: OutgoingRequestsController,
        @Inject private readonly relationshipController: RelationshipsController,
        @Inject private readonly relationshipTemplateController: RelationshipTemplateController
    ) {
        super();
    }

    protected async executeInternal(request: CreateAndCompleteOutgoingRequestFromRelationshipCreationChangeRequest): Promise<Result<LocalRequestDTO, ApplicationError>> {
        const template = await this.relationshipTemplateController.getRelationshipTemplate(CoreId.from(request.templateId));
        if (!template) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipTemplate));
        }

        const relationships = await this.relationshipController.getRelationships({ "cache.changes.id": request.relationshipChangeId });
        if (relationships.length === 0) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipChange));
        }
        const relationship = relationships[0];

        const params: ICreateOutgoingRequestFromRelationshipCreationChangeParameters = {
            template: template,
            creationChange: relationship.cache!.creationChange
        };

        const localRequest = await this.outgoingRequestsController.createFromRelationshipCreationChange(params);

        return Result.ok(RequestMapper.toLocalRequestDTO(localRequest));
    }
}
