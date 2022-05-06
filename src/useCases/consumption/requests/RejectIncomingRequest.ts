import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ConsumptionRequest, DecideRequestParametersJSON, IncomingRequestsController } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IncomingRequestStatusChangedEvent } from "../../../events/consumption/IncomingRequestStatusChangedEvent";
import { ConsumptionRequestDTO } from "../../../types";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface RejectIncomingRequestRequest extends DecideRequestParametersJSON {}

export class RejectIncomingRequestUseCase extends UseCase<RejectIncomingRequestRequest, ConsumptionRequestDTO> {
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController, @Inject private readonly eventBus: EventBus) {
        super();
    }

    protected async executeInternal(request: RejectIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        let consumptionRequest = await this.incomingRequestsController.getIncomingRequest(CoreId.from(request.requestId));

        if (!consumptionRequest) {
            return Result.fail(RuntimeErrors.general.recordNotFound(ConsumptionRequest));
        }

        const oldStatus = consumptionRequest.status;

        consumptionRequest = await this.incomingRequestsController.reject(request);

        const dto = RequestMapper.toConsumptionRequestDTO(consumptionRequest);

        this.eventBus.publish(
            new IncomingRequestStatusChangedEvent(this.incomingRequestsController.parent.accountController.identity.address.address, {
                request: dto,
                oldStatus,
                newStatus: dto.status
            })
        );

        return Result.ok(dto);
    }
}
