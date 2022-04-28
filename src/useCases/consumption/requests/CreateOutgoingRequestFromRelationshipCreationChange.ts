import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ICreateOutgoingRequestFromRelationshipCreationChangeParameters, OutgoingRequestsController } from "@nmshd/consumption";
import { CoreId, RelationshipChange, RelationshipsController, RelationshipTemplate, RelationshipTemplateController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RequestCreatedEvent } from "../../../events";
import { ConsumptionRequestDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CreateOutgoingRequestFromRelationshipCreationChangeRequest {
    templateId: string;
    relationshipChangeId: string;
}

export class CreateOutgoingRequestFromRelationshipCreationChangeUseCase extends UseCase<CreateOutgoingRequestFromRelationshipCreationChangeRequest, ConsumptionRequestDTO> {
    public constructor(
        @Inject private readonly outgoingRequestsController: OutgoingRequestsController,
        @Inject private readonly relationshipController: RelationshipsController,
        @Inject private readonly relationshipTemplateController: RelationshipTemplateController,
        @Inject private readonly eventBus: EventBus
    ) {
        super();
    }

    protected async executeInternal(request: CreateOutgoingRequestFromRelationshipCreationChangeRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        const template = await this.relationshipTemplateController.getRelationshipTemplate(CoreId.from(request.templateId));
        const relationships = await this.relationshipController.getRelationships({ "cache.changes.id": request.relationshipChangeId }); // eslint-disable-line @typescript-eslint/naming-convention

        if (relationships.length === 0) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipChange));
        }
        const relationship = relationships[0];

        if (!template) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipTemplate));
        }

        const params: ICreateOutgoingRequestFromRelationshipCreationChangeParameters = {
            template: template,
            creationChange: relationship.cache!.creationChange
        };

        const consumptionRequest = await this.outgoingRequestsController.createFromRelationshipCreationChange(params);

        const dto = RequestMapper.toConsumptionRequestDTO(consumptionRequest);

        this.eventBus.publish(new RequestCreatedEvent(this.outgoingRequestsController.parent.accountController.identity.address.address, dto));

        return Result.ok(dto);
    }
}
