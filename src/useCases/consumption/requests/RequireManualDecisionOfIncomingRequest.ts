import { ApplicationError, Result } from "@js-soft/ts-utils";
import { IncomingRequestsController } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
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
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController) {
        super();
    }

    protected async executeInternal(request: RequireManualDecisionOfIncomingRequestRequest): Promise<Result<LocalRequestDTO, ApplicationError>> {
        const localRequest = await this.incomingRequestsController.requireManualDecision({
            requestId: CoreId.from(request.requestId)
        });

        return Result.ok(RequestMapper.toLocalRequestDTO(localRequest));
    }
}
