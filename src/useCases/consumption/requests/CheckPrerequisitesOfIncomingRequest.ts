import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ConsumptionRequestStatus, IncomingRequestsController } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IncomingRequestStatusChangedEvent } from "../../../events/consumption/IncomingRequestStatusChangedEvent";
import { ConsumptionRequestDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CheckPrerequisitesOfIncomingRequestRequest {
    /**
     * @pattern CNSREQ[A-Za-z0-9]{14}
     */
    requestId: string;
}

class Validator extends SchemaValidator<CheckPrerequisitesOfIncomingRequestRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("CheckPrerequisitesOfIncomingRequestRequest"));
    }
}

export class CheckPrerequisitesOfIncomingRequestUseCase extends UseCase<CheckPrerequisitesOfIncomingRequestRequest, ConsumptionRequestDTO> {
    public constructor(@Inject validator: Validator, @Inject private readonly incomingRequestsController: IncomingRequestsController, @Inject private readonly eventBus: EventBus) {
        super(validator);
    }

    protected async executeInternal(request: CheckPrerequisitesOfIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        const consumptionRequest = await this.incomingRequestsController.checkPrerequisites({
            requestId: CoreId.from(request.requestId)
        });

        const dto = RequestMapper.toConsumptionRequestDTO(consumptionRequest);

        if (consumptionRequest.status === ConsumptionRequestStatus.DecisionRequired) {
            this.eventBus.publish(
                new IncomingRequestStatusChangedEvent(this.incomingRequestsController.parent.accountController.identity.address.address, {
                    request: dto,
                    oldStatus: ConsumptionRequestStatus.Open,
                    newStatus: dto.status
                })
            );
        }

        return Result.ok(dto);
    }
}
