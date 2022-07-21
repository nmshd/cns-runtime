import { ApplicationError, Result } from "@js-soft/ts-utils";
import { DecideRequestParametersJSON, IncomingRequestsController, LocalRequest } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { LocalRequestDTO } from "../../../types";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface RejectIncomingRequestRequest extends DecideRequestParametersJSON {}

export class RejectIncomingRequestUseCase extends UseCase<RejectIncomingRequestRequest, LocalRequestDTO> {
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController) {
        super();
    }

    protected async executeInternal(request: RejectIncomingRequestRequest): Promise<Result<LocalRequestDTO, ApplicationError>> {
        let localRequest = await this.incomingRequestsController.getIncomingRequest(CoreId.from(request.requestId));

        if (!localRequest) {
            return Result.fail(RuntimeErrors.general.recordNotFound(LocalRequest));
        }

        localRequest = await this.incomingRequestsController.reject(request);

        return Result.ok(RequestMapper.toLocalRequestDTO(localRequest));
    }
}
