import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ICreateOutgoingRequestFromRelationshipCreationChangeParameters, OutgoingRequestsController } from "@nmshd/consumption";
import { CoreId, Relationship, RelationshipsController, RelationshipTemplate, RelationshipTemplateController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RequestCreatedEvent } from "../../../events";
import { ConsumptionRequestDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CreateOutgoingRequestFromRelationshipCreationChangeRequest {
    templateId: string;
    relationshipId: string;
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
        const relationship = await this.relationshipController.getRelationship(CoreId.from(request.relationshipId));

        if (!template) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipTemplate));
        }

        if (!relationship) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Relationship));
        }

        const change = relationship.cache!.creationChange;

        const params: ICreateOutgoingRequestFromRelationshipCreationChangeParameters = {
            template: template,
            creationChange: change
        };

        const consumptionRequest = await this.outgoingRequestsController.createFromRelationshipCreationChange(params);

        const dto = RequestMapper.toConsumptionRequestDTO(consumptionRequest);

        this.eventBus.publish(new RequestCreatedEvent(this.outgoingRequestsController.parent.accountController.identity.address.address, dto));

        return Result.ok(dto);
    }
}
