import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import {
    CreateAttributeRequest,
    CreateAttributeUseCase,
    CreateSharedAttributeCopyRequest,
    CreateSharedAttributeCopyUseCase,
    DeleteAttributeRequest,
    DeleteAttributeUseCase,
    GetAttributeRequest,
    GetAttributesRequest,
    GetAttributesUseCase,
    GetAttributeUseCase,
    GetValidAttributesRequest,
    GetValidAttributesUseCase,
    SucceedAttributeRequest,
    SucceedAttributeUseCase,
    UpdateAttributeRequest,
    UpdateAttributeUseCase
} from "../../../useCases";
import { ExecuteIdentityAttributeQueryRequest, ExecuteIdentityAttributeQueryUseCase } from "../../../useCases/consumption/attributes/ExecuteIdentityAttributeQuery";
import { ExecuteRelationshipAttributeQueryRequest, ExecuteRelationshipAttributeQueryUseCase } from "../../../useCases/consumption/attributes/ExecuteRelationshipAttributeQuery";

export class AttributesFacade {
    public constructor(
        @Inject private readonly createAttributeUseCase: CreateAttributeUseCase,
        @Inject private readonly createSharedAttributeCopyUseCase: CreateSharedAttributeCopyUseCase,
        @Inject private readonly deleteAttributeUseCase: DeleteAttributeUseCase,
        @Inject private readonly getValidAttributesUseCase: GetValidAttributesUseCase,
        @Inject private readonly getAttributeUseCase: GetAttributeUseCase,
        @Inject private readonly getAttributesUseCase: GetAttributesUseCase,
        @Inject private readonly succeedAttributeUseCase: SucceedAttributeUseCase,
        @Inject private readonly updateAttributeUseCase: UpdateAttributeUseCase,
        @Inject private readonly executeIdentityAttributeQueryUseCase: ExecuteIdentityAttributeQueryUseCase,
        @Inject private readonly executeRelationshipAttributeQueryUseCase: ExecuteRelationshipAttributeQueryUseCase
    ) {}

    public async createAttribute(request: CreateAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.createAttributeUseCase.execute(request);
    }

    public async createSharedAttributeCopy(request: CreateSharedAttributeCopyRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.createSharedAttributeCopyUseCase.execute(request);
    }

    public async deleteAttribute(request: DeleteAttributeRequest): Promise<Result<void>> {
        return await this.deleteAttributeUseCase.execute(request);
    }

    public async getValidAttributes(request: GetValidAttributesRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        return await this.getValidAttributesUseCase.execute(request);
    }

    public async getAttribute(request: GetAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.getAttributeUseCase.execute(request);
    }

    public async getAttributes(request: GetAttributesRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        return await this.getAttributesUseCase.execute(request);
    }

    public async executeIdentityAttributeQuery(request: ExecuteIdentityAttributeQueryRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        return await this.executeIdentityAttributeQueryUseCase.execute(request);
    }

    public async executeRelationshipAttributeQuery(request: ExecuteRelationshipAttributeQueryRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        return await this.executeRelationshipAttributeQueryUseCase.execute(request);
    }

    public async succeedAttribute(request: SucceedAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.succeedAttributeUseCase.execute(request);
    }

    public async updateAttribute(request: UpdateAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        return await this.updateAttributeUseCase.execute(request);
    }
}
