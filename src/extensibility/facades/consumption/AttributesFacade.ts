import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { LocalAttributeDTO } from "../../../types";
import {
    CreateAttributeRequest,
    CreateAttributeUseCase,
    CreateSharedAttributeCopyRequest,
    CreateSharedAttributeCopyUseCase,
    DeleteAttributeRequest,
    DeleteAttributeUseCase,
    ExecuteIdentityAttributeQueryRequest,
    ExecuteIdentityAttributeQueryUseCase,
    ExecuteRelationshipAttributeQueryRequest,
    ExecuteRelationshipAttributeQueryUseCase,
    GetAttributeRequest,
    GetAttributesRequest,
    GetAttributesUseCase,
    GetAttributeUseCase,
    GetPeerAttributesRequest,
    GetPeerAttributesUseCase,
    GetSharedToPeerAttributesRequest,
    GetSharedToPeerAttributesUseCase,
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
        @Inject private readonly getPeerAttributesUseCase: GetPeerAttributesUseCase,
        @Inject private readonly getSharedToPeerAttributesUseCase: GetSharedToPeerAttributesUseCase,
        @Inject private readonly getAttributeUseCase: GetAttributeUseCase,
        @Inject private readonly getAttributesUseCase: GetAttributesUseCase,
        @Inject private readonly succeedAttributeUseCase: SucceedAttributeUseCase,
        @Inject private readonly updateAttributeUseCase: UpdateAttributeUseCase,
        @Inject private readonly executeIdentityAttributeQueryUseCase: ExecuteIdentityAttributeQueryUseCase,
        @Inject private readonly executeRelationshipAttributeQueryUseCase: ExecuteRelationshipAttributeQueryUseCase
    ) {}

    public async createAttribute(request: CreateAttributeRequest): Promise<Result<LocalAttributeDTO>> {
        return await this.createAttributeUseCase.execute(request);
    }

    public async createSharedAttributeCopy(request: CreateSharedAttributeCopyRequest): Promise<Result<LocalAttributeDTO>> {
        return await this.createSharedAttributeCopyUseCase.execute(request);
    }

    public async deleteAttribute(request: DeleteAttributeRequest): Promise<Result<void>> {
        return await this.deleteAttributeUseCase.execute(request);
    }

    public async getPeerAttributes(request: GetPeerAttributesRequest): Promise<Result<LocalAttributeDTO[]>> {
        return await this.getPeerAttributesUseCase.execute(request);
    }

    public async getSharedToPeerAttributes(request: GetSharedToPeerAttributesRequest): Promise<Result<LocalAttributeDTO[]>> {
        return await this.getSharedToPeerAttributesUseCase.execute(request);
    }

    public async getAttribute(request: GetAttributeRequest): Promise<Result<LocalAttributeDTO>> {
        return await this.getAttributeUseCase.execute(request);
    }

    public async getAttributes(request: GetAttributesRequest): Promise<Result<LocalAttributeDTO[]>> {
        return await this.getAttributesUseCase.execute(request);
    }

    public async executeIdentityAttributeQuery(request: ExecuteIdentityAttributeQueryRequest): Promise<Result<LocalAttributeDTO[]>> {
        return await this.executeIdentityAttributeQueryUseCase.execute(request);
    }

    public async executeRelationshipAttributeQuery(request: ExecuteRelationshipAttributeQueryRequest): Promise<Result<LocalAttributeDTO[]>> {
        return await this.executeRelationshipAttributeQueryUseCase.execute(request);
    }

    public async succeedAttribute(request: SucceedAttributeRequest): Promise<Result<LocalAttributeDTO>> {
        return await this.succeedAttributeUseCase.execute(request);
    }

    public async updateAttribute(request: UpdateAttributeRequest): Promise<Result<LocalAttributeDTO>> {
        return await this.updateAttributeUseCase.execute(request);
    }
}
