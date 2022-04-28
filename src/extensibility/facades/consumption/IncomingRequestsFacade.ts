import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { ConsumptionRequestDTO, RequestValidationResultDTO } from "../../../types";
import { AcceptIncomingRequestRequest, AcceptIncomingRequestUseCase } from "../../../useCases/consumption/requests/AcceptIncomingRequest";
import { CanAcceptIncomingRequestUseCase } from "../../../useCases/consumption/requests/CanAcceptIncomingRequest";
import { CheckPrerequisitesOfIncomingRequestRequest, CheckPrerequisitesOfIncomingRequestUseCase } from "../../../useCases/consumption/requests/CheckPrerequisitesOfIncomingRequest";
import { CompleteIncomingRequestRequest, CompleteIncomingRequestUseCase } from "../../../useCases/consumption/requests/CompleteIncomingRequest";
import { ReceivedIncomingRequestRequest, ReceivedIncomingRequestUseCase } from "../../../useCases/consumption/requests/ReceivedIncomingRequest";
import {
    RequireManualDecisionOfIncomingRequestRequest,
    RequireManualDecisionOfIncomingRequestUseCase
} from "../../../useCases/consumption/requests/RequireManualDecisionOfIncomingRequest";

export class IncomingRequestsFacade {
    public constructor(
        @Inject private readonly receivedUseCase: ReceivedIncomingRequestUseCase,
        @Inject private readonly checkPrerequisitesUseCase: CheckPrerequisitesOfIncomingRequestUseCase,
        @Inject private readonly requireManualDecisionUseCase: RequireManualDecisionOfIncomingRequestUseCase,
        @Inject private readonly canAcceptUseCase: CanAcceptIncomingRequestUseCase,
        @Inject private readonly acceptUseCase: AcceptIncomingRequestUseCase,
        @Inject private readonly completeUseCase: CompleteIncomingRequestUseCase
    ) {}

    public async received(request: ReceivedIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.receivedUseCase.execute(request);
    }

    public async checkPrerequisites(request: CheckPrerequisitesOfIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.checkPrerequisitesUseCase.execute(request);
    }

    public async requireManualDecision(request: RequireManualDecisionOfIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.requireManualDecisionUseCase.execute(request);
    }

    public async canAccept(request: AcceptIncomingRequestRequest): Promise<Result<RequestValidationResultDTO>> {
        return await this.canAcceptUseCase.execute(request);
    }

    public async accept(request: AcceptIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.acceptUseCase.execute(request);
    }

    public async complete(request: CompleteIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.completeUseCase.execute(request);
    }
}
