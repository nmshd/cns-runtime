import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ConsumptionRequestStatus, IncomingRequestsController } from "@nmshd/consumption";
import { CoreId, IMessage, IRelationshipChange, Message, MessageController, RelationshipChange, RelationshipsController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IncomingRequestStatusChangedEvent } from "../../../events/consumption/IncomingRequestStatusChangedEvent";
import { ConsumptionRequestDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CompleteIncomingRequestRequest {
    /**
     * @pattern CNSREQ[A-Za-z0-9]{14}
     */
    requestId: string;

    /**
     * @pattern (MSG|RCH)[A-Za-z0-9]{17}
     */
    responseSourceId: string;
}

class Validator extends SchemaValidator<CompleteIncomingRequestRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("CompleteIncomingRequestRequest"));
    }
}

export class CompleteIncomingRequestUseCase extends UseCase<CompleteIncomingRequestRequest, ConsumptionRequestDTO> {
    public constructor(
        @Inject validator: Validator,
        @Inject private readonly incomingRequestsController: IncomingRequestsController,
        @Inject private readonly eventBus: EventBus,
        @Inject private readonly messageController: MessageController,
        @Inject private readonly relationshipController: RelationshipsController
    ) {
        super(validator);
    }

    protected async executeInternal(request: CompleteIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        let responseSourceObject: IMessage | IRelationshipChange;

        if (request.responseSourceId.startsWith("MSG")) {
            const message = await this.messageController.getMessage(CoreId.from(request.responseSourceId));
            if (!message) {
                return Result.fail(RuntimeErrors.general.recordNotFound(Message));
            }
            responseSourceObject = message;
        } else if (request.responseSourceId.startsWith("RCH")) {
            const relationships = await this.relationshipController.getRelationships({ "cache.changes.id": request.responseSourceId }); // eslint-disable-line @typescript-eslint/naming-convention

            if (relationships.length === 0) {
                return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipChange));
            }
            responseSourceObject = relationships[0].cache!.creationChange;
        } else {
            throw new Error("Invalid response source id");
        }

        const consumptionRequest = await this.incomingRequestsController.complete({
            requestId: CoreId.from(request.requestId),
            responseSourceObject
        });

        const dto = RequestMapper.toConsumptionRequestDTO(consumptionRequest);

        if (consumptionRequest.status === ConsumptionRequestStatus.Completed) {
            this.eventBus.publish(
                new IncomingRequestStatusChangedEvent(this.incomingRequestsController.parent.accountController.identity.address.address, {
                    request: dto,
                    oldStatus: ConsumptionRequestStatus.Decided,
                    newStatus: dto.status
                })
            );
        }

        return Result.ok(dto);
    }
}
