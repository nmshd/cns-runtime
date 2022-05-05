import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { ConsumptionRequestDTO, RequestValidationResultDTO } from "../../../types";
import {
    CanCreateOutgoingRequestUseCase,
    CompleteOutgoingRequestRequest,
    CompleteOutgoingRequestUseCase,
    CreateOutgoingRequestFromRelationshipCreationChangeRequest,
    CreateOutgoingRequestFromRelationshipCreationChangeUseCase,
    CreateOutgoingRequestRequest,
    CreateOutgoingRequestUseCase,
    GetOutgoingRequestRequest,
    GetOutgoingRequestsRequest,
    GetOutgoingRequestsUseCase,
    GetOutgoingRequestUseCase,
    SentOutgoingRequestRequest,
    SentOutgoingRequestUseCase
} from "../../../useCases";

export class OutgoingRequestsFacade {
    public constructor(
        @Inject private readonly canCreateOutgoingRequests: CanCreateOutgoingRequestUseCase,
        @Inject private readonly createOutgoingRequests: CreateOutgoingRequestUseCase,
        @Inject private readonly sentOutgoingRequests: SentOutgoingRequestUseCase,
        @Inject private readonly createOutgoingRequestFromRelationshipCreationChange: CreateOutgoingRequestFromRelationshipCreationChangeUseCase,
        @Inject private readonly completeOutgoingRequests: CompleteOutgoingRequestUseCase,
        @Inject private readonly getOutgoingRequest: GetOutgoingRequestUseCase,
        @Inject private readonly getOutgoingRequests: GetOutgoingRequestsUseCase
    ) {}

    public async canCreate(request: CreateOutgoingRequestRequest): Promise<Result<RequestValidationResultDTO>> {
        return await this.canCreateOutgoingRequests.execute(request);
    }

    public async create(request: CreateOutgoingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.createOutgoingRequests.execute(request);
    }

    public async createFromRelationshipCreationChange(request: CreateOutgoingRequestFromRelationshipCreationChangeRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.createOutgoingRequestFromRelationshipCreationChange.execute(request);
    }

    public async sent(request: SentOutgoingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.sentOutgoingRequests.execute(request);
    }

    public async complete(request: CompleteOutgoingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.completeOutgoingRequests.execute(request);
    }

    public async getRequest(request: GetOutgoingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.getOutgoingRequest.execute(request);
    }

    public async getRequests(request: GetOutgoingRequestsRequest): Promise<Result<ConsumptionRequestDTO[]>> {
        return await this.getOutgoingRequests.execute(request);
    }
}
