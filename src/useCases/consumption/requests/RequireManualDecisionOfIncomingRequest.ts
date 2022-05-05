import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ConsumptionRequestStatus, IncomingRequestsController } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IncomingRequestStatusChangedEvent } from "../../../events/consumption/IncomingRequestStatusChangedEvent";
import { ConsumptionRequestDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface RequireManualDecisionOfIncomingRequestRequest {
    /**
     * @pattern CNSREQ[A-Za-z0-9]{14}
     */
    requestId: string;
}

export class RequireManualDecisionOfIncomingRequestUseCase extends UseCase<RequireManualDecisionOfIncomingRequestRequest, ConsumptionRequestDTO> {
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController, @Inject private readonly eventBus: EventBus) {
        super();
    }

    protected async executeInternal(request: RequireManualDecisionOfIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        const consumptionRequest = await this.incomingRequestsController.requireManualDecision({
            requestId: CoreId.from(request.requestId)
        });

        const dto = RequestMapper.toConsumptionRequestDTO(consumptionRequest);

        if (consumptionRequest.status === ConsumptionRequestStatus.ManualDecisionRequired) {
            this.eventBus.publish(
                new IncomingRequestStatusChangedEvent(this.incomingRequestsController.parent.accountController.identity.address.address, {
                    request: dto,
                    oldStatus: ConsumptionRequestStatus.DecisionRequired,
                    newStatus: dto.status
                })
            );
        }

        return Result.ok(dto);
    }
}
