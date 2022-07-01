import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { DecideRequestParametersJSON, IncomingRequestsController, LocalRequest } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IncomingRequestStatusChangedEvent } from "../../../events/consumption/IncomingRequestStatusChangedEvent";
import { LocalRequestDTO } from "../../../types";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface AcceptIncomingRequestRequest extends DecideRequestParametersJSON {}

export class AcceptIncomingRequestUseCase extends UseCase<AcceptIncomingRequestRequest, LocalRequestDTO> {
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController, @Inject private readonly eventBus: EventBus) {
        super();
    }

    protected async executeInternal(request: AcceptIncomingRequestRequest): Promise<Result<LocalRequestDTO, ApplicationError>> {
        let consumptionRequest = await this.incomingRequestsController.getIncomingRequest(CoreId.from(request.requestId));

        if (!consumptionRequest) {
            return Result.fail(RuntimeErrors.general.recordNotFound(LocalRequest));
        }

        const oldStatus = consumptionRequest.status;

        consumptionRequest = await this.incomingRequestsController.accept(request);

        const dto = RequestMapper.toLocalRequestDTO(consumptionRequest);

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
