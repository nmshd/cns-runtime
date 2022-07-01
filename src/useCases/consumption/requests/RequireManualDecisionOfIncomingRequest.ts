import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { IncomingRequestsController, LocalRequestStatus } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IncomingRequestStatusChangedEvent } from "../../../events/consumption/IncomingRequestStatusChangedEvent";
import { LocalRequestDTO } from "../../../types";
import { UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface RequireManualDecisionOfIncomingRequestRequest {
    /**
     * @pattern REQ[A-Za-z0-9]{17}
     */
    requestId: string;
}

export class RequireManualDecisionOfIncomingRequestUseCase extends UseCase<RequireManualDecisionOfIncomingRequestRequest, LocalRequestDTO> {
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController, @Inject private readonly eventBus: EventBus) {
        super();
    }

    protected async executeInternal(request: RequireManualDecisionOfIncomingRequestRequest): Promise<Result<LocalRequestDTO, ApplicationError>> {
        const consumptionRequest = await this.incomingRequestsController.requireManualDecision({
            requestId: CoreId.from(request.requestId)
        });

        const dto = RequestMapper.toLocalRequestDTO(consumptionRequest);

        this.eventBus.publish(
            new IncomingRequestStatusChangedEvent(this.incomingRequestsController.parent.accountController.identity.address.address, {
                request: dto,
                oldStatus: LocalRequestStatus.DecisionRequired,
                newStatus: dto.status
            })
        );

        return Result.ok(dto);
    }
}
