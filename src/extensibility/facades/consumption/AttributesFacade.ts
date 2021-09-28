import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import {
    CreateAttributeRequest,
    CreateAttributeUseCase,
    DeleteAttributeByNameRequest,
    DeleteAttributeByNameUseCase,
    DeleteAttributeRequest,
    DeleteAttributeUseCase,
    GetAllValidUseCase,
    GetAttributeByNameRequest,
    GetAttributeByNameUseCase,
    GetAttributeRequest,
    GetAttributesByNameRequest,
    GetAttributesByNameResponse,
    GetAttributesByNameUseCase,
    GetAttributesRequest,
    GetAttributesUseCase,
    GetAttributeUseCase,
    GetHistoryByNameRequest,
    GetHistoryByNameUseCase,
    SucceedAttributeRequest,
    SucceedAttributeUseCase,
    UpdateAttributeRequest,
    UpdateAttributeUseCase
} from "../../../useCases";

export class AttributesFacade {
    public constructor(
        @Inject private readonly createAttributeUseCase: CreateAttributeUseCase,
        @Inject private readonly deleteAttributeUseCase: DeleteAttributeUseCase,
        @Inject private readonly deleteAttributeByNameUseCase: DeleteAttributeByNameUseCase,
        @Inject private readonly getAllValidUseCase: GetAllValidUseCase,
        @Inject private readonly getAttributeUseCase: GetAttributeUseCase,
        @Inject private readonly getAttributeByNameUseCase: GetAttributeByNameUseCase,
        @Inject private readonly getAttributesUseCase: GetAttributesUseCase,
        @Inject private readonly getAttributesByNameUseCase: GetAttributesByNameUseCase,
        @Inject private readonly getHistoryByNameUseCase: GetHistoryByNameUseCase,
        @Inject private readonly succeedAttributeUseCase: SucceedAttributeUseCase,
        @Inject private readonly updateAttributeUseCase: UpdateAttributeUseCase
    ) {}

    public async createAttribute(request: CreateAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.createAttributeUseCase.execute(request);
    }

    public async deleteAttribute(request: DeleteAttributeRequest): Promise<Result<void>> {
        return await this.deleteAttributeUseCase.execute(request);
    }

    public async deleteAttributeByName(request: DeleteAttributeByNameRequest): Promise<Result<void>> {
        return await this.deleteAttributeByNameUseCase.execute(request);
    }

    public async getAllValid(): Promise<Result<ConsumptionAttributeDTO[]>> {
        return await this.getAllValidUseCase.execute();
    }

    public async getAttribute(request: GetAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.getAttributeUseCase.execute(request);
    }

    public async getAttributeByName(request: GetAttributeByNameRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.getAttributeByNameUseCase.execute(request);
    }

    public async getAttributes(request: GetAttributesRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        return await this.getAttributesUseCase.execute(request);
    }

    public async getAttributesByName(request: GetAttributesByNameRequest): Promise<Result<GetAttributesByNameResponse>> {
        return await this.getAttributesByNameUseCase.execute(request);
    }

    public async getHistoryByName(request: GetHistoryByNameRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        return await this.getHistoryByNameUseCase.execute(request);
    }

    public async succeedAttribute(request: SucceedAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.succeedAttributeUseCase.execute(request);
    }

    public async updateAttribute(request: UpdateAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.updateAttributeUseCase.execute(request);
    }
}
