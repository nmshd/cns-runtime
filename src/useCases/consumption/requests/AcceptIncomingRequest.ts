import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { ConsumptionRequest, DecideRequestParametersJSON, IncomingRequestsController } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IncomingRequestStatusChangedEvent } from "../../../events/consumption/IncomingRequestStatusChangedEvent";
import { ConsumptionRequestDTO } from "../../../types";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface AcceptIncomingRequestRequest extends DecideRequestParametersJSON {}

export class AcceptIncomingRequestUseCase extends UseCase<AcceptIncomingRequestRequest, ConsumptionRequestDTO> {
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController, @Inject private readonly eventBus: EventBus) {
        super();
    }

    protected async executeInternal(request: AcceptIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        let consumptionRequest = await this.incomingRequestsController.getIncomingRequest(CoreId.from(request.requestId));

        if (!consumptionRequest) {
            return Result.fail(RuntimeErrors.general.recordNotFound(ConsumptionRequest));
        }

        const oldStatus = consumptionRequest.status;

        consumptionRequest = await this.incomingRequestsController.accept(request);

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
