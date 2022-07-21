import { ApplicationError, Result } from "@js-soft/ts-utils";
import { DecideRequestParametersJSON, IncomingRequestsController, LocalRequest } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { LocalRequestDTO } from "../../../types";
import { RuntimeErrors, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface AcceptIncomingRequestRequest extends DecideRequestParametersJSON {}

export class AcceptIncomingRequestUseCase extends UseCase<AcceptIncomingRequestRequest, LocalRequestDTO> {
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController) {
        super();
    }

    protected async executeInternal(request: AcceptIncomingRequestRequest): Promise<Result<LocalRequestDTO, ApplicationError>> {
        let localRequest = await this.incomingRequestsController.getIncomingRequest(CoreId.from(request.requestId));

        if (!localRequest) {
            return Result.fail(RuntimeErrors.general.recordNotFound(LocalRequest));
        }

        localRequest = await this.incomingRequestsController.accept(request);

        return Result.ok(RequestMapper.toLocalRequestDTO(localRequest));
    }
}
