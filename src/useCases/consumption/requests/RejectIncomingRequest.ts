import { ApplicationError, EventBus, Result } from "@js-soft/ts-utils";
import { DecideRequestParametersJSON, IncomingRequestsController, LocalRequest } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IncomingRequestStatusChangedEvent } from "../../../events/consumption/IncomingRequestStatusChangedEvent";
import { LocalRequestDTO } from "../../../types";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface RejectIncomingRequestRequest extends DecideRequestParametersJSON {}

export class RejectIncomingRequestUseCase extends UseCase<RejectIncomingRequestRequest, LocalRequestDTO> {
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController, @Inject private readonly eventBus: EventBus) {
        super();
    }

    protected async executeInternal(request: RejectIncomingRequestRequest): Promise<Result<LocalRequestDTO, ApplicationError>> {
        let localRequest = await this.incomingRequestsController.getIncomingRequest(CoreId.from(request.requestId));

        if (!localRequest) {
            return Result.fail(RuntimeErrors.general.recordNotFound(LocalRequest));
        }

        const oldStatus = localRequest.status;

        localRequest = await this.incomingRequestsController.reject(request);

        const dto = RequestMapper.toLocalRequestDTO(localRequest);

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
