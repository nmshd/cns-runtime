import { ApplicationError, Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { RelationshipDTO } from "../../../types";
import {
    AcceptRelationshipChangeRequest,
    AcceptRelationshipChangeUseCase,
    CreateRelationshipChangeRequest,
    CreateRelationshipChangeUseCase,
    CreateRelationshipRequest,
    CreateRelationshipUseCase,
    GetAttributesForRelationshipRequest,
    GetAttributesForRelationshipResponse,
    GetAttributesForRelationshipUseCase,
    GetRelationshipByAddressRequest,
    GetRelationshipByAddressUseCase,
    GetRelationshipRequest,
    GetRelationshipsRequest,
    GetRelationshipsUseCase,
    GetRelationshipUseCase,
    RejectRelationshipChangeRequest,
    RejectRelationshipChangeUseCase,
    RevokeRelationshipChangeRequest,
    RevokeRelationshipChangeUseCase
} from "../../../useCases";

export class RelationshipsFacade {
    public constructor(
        @Inject private readonly getRelationshipsUseCase: GetRelationshipsUseCase,
        @Inject private readonly getRelationshipUseCase: GetRelationshipUseCase,
        @Inject private readonly getRelationshipByAddressUseCase: GetRelationshipByAddressUseCase,
        @Inject private readonly createRelationshipUseCase: CreateRelationshipUseCase,
        @Inject private readonly createRelationshipChangeUseCase: CreateRelationshipChangeUseCase,
        @Inject private readonly acceptRelationshipChangeUseCase: AcceptRelationshipChangeUseCase,
        @Inject private readonly rejectRelationshipChangeUseCase: RejectRelationshipChangeUseCase,
        @Inject private readonly revokeRelationshipChangeUseCase: RevokeRelationshipChangeUseCase,
        @Inject private readonly getAttributesForRelationshipUseCase: GetAttributesForRelationshipUseCase
    ) {}

    public async getRelationships(request: GetRelationshipsRequest): Promise<Result<RelationshipDTO[], ApplicationError>> {
        return await this.getRelationshipsUseCase.execute(request);
    }

    public async getRelationship(request: GetRelationshipRequest): Promise<Result<RelationshipDTO, ApplicationError>> {
        return await this.getRelationshipUseCase.execute(request);
    }

    public async getRelationshipByAddress(request: GetRelationshipByAddressRequest): Promise<Result<RelationshipDTO, ApplicationError>> {
        return await this.getRelationshipByAddressUseCase.execute(request);
    }

    public async createRelationship(request: CreateRelationshipRequest): Promise<Result<RelationshipDTO, ApplicationError>> {
        return await this.createRelationshipUseCase.execute(request);
    }

    public async createRelationshipChange(request: CreateRelationshipChangeRequest): Promise<Result<RelationshipDTO, ApplicationError>> {
        return await this.createRelationshipChangeUseCase.execute(request);
    }

    public async acceptRelationshipChange(request: AcceptRelationshipChangeRequest): Promise<Result<RelationshipDTO, ApplicationError>> {
        return await this.acceptRelationshipChangeUseCase.execute(request);
    }

    public async rejectRelationshipChange(request: RejectRelationshipChangeRequest): Promise<Result<RelationshipDTO, ApplicationError>> {
        return await this.rejectRelationshipChangeUseCase.execute(request);
    }

    public async revokeRelationshipChange(request: RevokeRelationshipChangeRequest): Promise<Result<RelationshipDTO, ApplicationError>> {
        return await this.revokeRelationshipChangeUseCase.execute(request);
    }

    public async getAttributesForRelationship(request: GetAttributesForRelationshipRequest): Promise<Result<GetAttributesForRelationshipResponse, ApplicationError>> {
        return await this.getAttributesForRelationshipUseCase.execute(request);
    }
}
