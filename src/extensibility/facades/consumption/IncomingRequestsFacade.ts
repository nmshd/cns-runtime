import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { LocalRequestDTO, RequestValidationResultDTO } from "../../../types";
import {
    AcceptIncomingRequestRequest,
    AcceptIncomingRequestUseCase,
    CanAcceptIncomingRequestUseCase,
    CanRejectIncomingRequestUseCase,
    CheckPrerequisitesOfIncomingRequestRequest,
    CheckPrerequisitesOfIncomingRequestUseCase,
    CompleteIncomingRequestRequest,
    CompleteIncomingRequestUseCase,
    GetIncomingRequestRequest,
    GetIncomingRequestsRequest,
    GetIncomingRequestsUseCase,
    GetIncomingRequestUseCase,
    ReceivedIncomingRequestRequest,
    ReceivedIncomingRequestUseCase,
    RejectIncomingRequestRequest,
    RejectIncomingRequestUseCase,
    RequireManualDecisionOfIncomingRequestRequest,
    RequireManualDecisionOfIncomingRequestUseCase
} from "../../../useCases";

export class IncomingRequestsFacade {
    public constructor(
        @Inject private readonly receivedUseCase: ReceivedIncomingRequestUseCase,
        @Inject private readonly checkPrerequisitesUseCase: CheckPrerequisitesOfIncomingRequestUseCase,
        @Inject private readonly requireManualDecisionUseCase: RequireManualDecisionOfIncomingRequestUseCase,
        @Inject private readonly canAcceptUseCase: CanAcceptIncomingRequestUseCase,
        @Inject private readonly acceptUseCase: AcceptIncomingRequestUseCase,
        @Inject private readonly canRejectUseCase: CanRejectIncomingRequestUseCase,
        @Inject private readonly rejectUseCase: RejectIncomingRequestUseCase,
        @Inject private readonly completeUseCase: CompleteIncomingRequestUseCase,
        @Inject private readonly getRequestUseCase: GetIncomingRequestUseCase,
        @Inject private readonly getRequestsUseCase: GetIncomingRequestsUseCase
    ) {}

    public async received(request: ReceivedIncomingRequestRequest): Promise<Result<LocalRequestDTO>> {
        return await this.receivedUseCase.execute(request);
    }

    public async checkPrerequisites(request: CheckPrerequisitesOfIncomingRequestRequest): Promise<Result<LocalRequestDTO>> {
        return await this.checkPrerequisitesUseCase.execute(request);
    }

    public async requireManualDecision(request: RequireManualDecisionOfIncomingRequestRequest): Promise<Result<LocalRequestDTO>> {
        return await this.requireManualDecisionUseCase.execute(request);
    }

    public async canAccept(request: AcceptIncomingRequestRequest): Promise<Result<RequestValidationResultDTO>> {
        return await this.canAcceptUseCase.execute(request);
    }

    public async accept(request: AcceptIncomingRequestRequest): Promise<Result<LocalRequestDTO>> {
        return await this.acceptUseCase.execute(request);
    }

    public async canReject(request: RejectIncomingRequestRequest): Promise<Result<RequestValidationResultDTO>> {
        return await this.canRejectUseCase.execute(request);
    }

    public async reject(request: RejectIncomingRequestRequest): Promise<Result<LocalRequestDTO>> {
        return await this.rejectUseCase.execute(request);
    }

    public async complete(request: CompleteIncomingRequestRequest): Promise<Result<LocalRequestDTO>> {
        return await this.completeUseCase.execute(request);
    }

    public async getRequest(request: GetIncomingRequestRequest): Promise<Result<LocalRequestDTO>> {
        return await this.getRequestUseCase.execute(request);
    }

    public async getRequests(request: GetIncomingRequestsRequest): Promise<Result<LocalRequestDTO[]>> {
        return await this.getRequestsUseCase.execute(request);
    }
}
