import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import {
    CreateAttributeRequest,
    CreateAttributeUseCase,
    CreateShareAttributeCopyRequest,
    CreateSharedAttributeCopyUseCase,
    DeleteAttributeRequest,
    DeleteAttributeUseCase,
    GetAllValidUseCase,
    GetAttributeRequest,
    GetAttributesRequest,
    GetAttributesUseCase,
    GetAttributeUseCase,
    SucceedAttributeRequest,
    SucceedAttributeUseCase,
    UpdateAttributeRequest,
    UpdateAttributeUseCase
} from "../../../useCases";

export class AttributesFacade {
    public constructor(
        @Inject private readonly createAttributeUseCase: CreateAttributeUseCase,
        @Inject private readonly createSharedAttributeCopyUseCase: CreateSharedAttributeCopyUseCase,
        @Inject private readonly deleteAttributeUseCase: DeleteAttributeUseCase,
        @Inject private readonly getAllValidUseCase: GetAllValidUseCase,
        @Inject private readonly getAttributeUseCase: GetAttributeUseCase,
        @Inject private readonly getAttributesUseCase: GetAttributesUseCase,
        @Inject private readonly succeedAttributeUseCase: SucceedAttributeUseCase,
        @Inject private readonly updateAttributeUseCase: UpdateAttributeUseCase
    ) {}

    public async createAttribute(request: CreateAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.createAttributeUseCase.execute(request);
    }

    public async createSharedAttributeCopy(request: CreateShareAttributeCopyRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.createSharedAttributeCopyUseCase.execute(request);
    }

    public async deleteAttribute(request: DeleteAttributeRequest): Promise<Result<void>> {
        return await this.deleteAttributeUseCase.execute(request);
    }

    public async getAllValid(): Promise<Result<ConsumptionAttributeDTO[]>> {
        return await this.getAllValidUseCase.execute();
    }

    public async getAttribute(request: GetAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.getAttributeUseCase.execute(request);
    }

    public async getAttributes(request: GetAttributesRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        return await this.getAttributesUseCase.execute(request);
    }

    public async succeedAttribute(request: SucceedAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.succeedAttributeUseCase.execute(request);
    }

    public async updateAttribute(request: UpdateAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.updateAttributeUseCase.execute(request);
    }
}
