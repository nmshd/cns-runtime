import { ApplicationError, Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { RelationshipInfoDTO } from "../../../types";
import {
    CreateRelationshipInfoRequest,
    CreateRelationshipInfoUseCase,
    DeleteRelationshipInfoByRelationshipRequest,
    DeleteRelationshipInfoByRelationshipUseCase,
    DeleteRelationshipInfoRequest,
    DeleteRelationshipInfoUseCase,
    GetRelationshipInfoByRelationshipRequest,
    GetRelationshipInfoByRelationshipUseCase,
    GetRelationshipInfoRequest,
    GetRelationshipInfoUseCase,
    UpdateRelationshipInfoRequest,
    UpdateRelationshipInfoUseCase
} from "../../../useCases";

export class RelationshipInfoFacade {
    public constructor(
        @Inject private readonly createRelationshipInfoUseCase: CreateRelationshipInfoUseCase,
        @Inject private readonly deleteRelationshipInfoUseCase: DeleteRelationshipInfoUseCase,
        @Inject private readonly deleteRelationshipInfoByRelationshipUseCase: DeleteRelationshipInfoByRelationshipUseCase,
        @Inject private readonly getRelationshipInfoUseCase: GetRelationshipInfoUseCase,
        @Inject private readonly getRelationshipInfoByRelationshipUseCase: GetRelationshipInfoByRelationshipUseCase,
        @Inject private readonly updateRelationshipInfoUseCase: UpdateRelationshipInfoUseCase
    ) {}

    public async createRelationshipInfo(request: CreateRelationshipInfoRequest): Promise<Result<RelationshipInfoDTO, ApplicationError>> {
        return await this.createRelationshipInfoUseCase.execute(request);
    }

    public async deleteRelationshipInfo(request: DeleteRelationshipInfoRequest): Promise<Result<void, ApplicationError>> {
        return await this.deleteRelationshipInfoUseCase.execute(request);
    }

    public async deleteRelationshipInfoByRelationship(request: DeleteRelationshipInfoByRelationshipRequest): Promise<Result<void, ApplicationError>> {
        return await this.deleteRelationshipInfoByRelationshipUseCase.execute(request);
    }

    public async getRelationshipInfo(request: GetRelationshipInfoRequest): Promise<Result<RelationshipInfoDTO, ApplicationError>> {
        return await this.getRelationshipInfoUseCase.execute(request);
    }

    public async getRelationshipInfoByRelationship(request: GetRelationshipInfoByRelationshipRequest): Promise<Result<RelationshipInfoDTO, ApplicationError>> {
        return await this.getRelationshipInfoByRelationshipUseCase.execute(request);
    }

    public async updateRelationshipInfo(request: UpdateRelationshipInfoRequest): Promise<Result<RelationshipInfoDTO, ApplicationError>> {
        return await this.updateRelationshipInfoUseCase.execute(request);
    }
}
