import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ConsumptionRequestStatus, IncomingRequestsController } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IncomingRequestStatusChangedEvent } from "../../../events/consumption/IncomingRequestStatusChangedEvent";
import { ConsumptionRequestDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CheckPrerequisitesOfIncomingRequestRequest {
    requestId: string;
}

export class CheckPrerequisitesOfIncomingRequestUseCase extends UseCase<CheckPrerequisitesOfIncomingRequestRequest, ConsumptionRequestDTO> {
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController, @Inject private readonly eventBus: EventBus) {
        super();
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
