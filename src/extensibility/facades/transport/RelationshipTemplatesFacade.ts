import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { RelationshipTemplateDTO } from "../../../types";
import {
    CreateOwnRelationshipTemplateRequest,
    CreateOwnRelationshipTemplateUseCase,
    CreateQrCodeForOwnTemplateRequest,
    CreateQrCodeForOwnTemplateResponse,
    CreateQrCodeForOwnTemplateUseCase,
    GetRelationshipTemplateRequest,
    GetRelationshipTemplatesRequest,
    GetRelationshipTemplatesUseCase,
    GetRelationshipTemplateUseCase,
    LoadPeerRelationshipTemplateRequest,
    LoadPeerRelationshipTemplateUseCase
} from "../../../useCases";

export class RelationshipTemplatesFacade {
    public constructor(
        @Inject private readonly createOwnRelationshipTemplateUseCase: CreateOwnRelationshipTemplateUseCase,
        @Inject private readonly loadPeerRelationshipTemplateUseCase: LoadPeerRelationshipTemplateUseCase,
        @Inject private readonly getRealtionshipTemplatesUseCase: GetRelationshipTemplatesUseCase,
        @Inject private readonly getRelationshipTemplateUseCase: GetRelationshipTemplateUseCase,
        @Inject private readonly createQrCodeForOwnTemplateUseCase: CreateQrCodeForOwnTemplateUseCase
    ) {}

    public async createOwnRelationshipTemplate(request: CreateOwnRelationshipTemplateRequest): Promise<Result<RelationshipTemplateDTO>> {
        return await this.createOwnRelationshipTemplateUseCase.execute(request);
    }

    public async loadPeerRelationshipTemplate(request: LoadPeerRelationshipTemplateRequest): Promise<Result<RelationshipTemplateDTO>> {
        return await this.loadPeerRelationshipTemplateUseCase.execute(request);
    }

    public async getRelationshipTemplates(request: GetRelationshipTemplatesRequest): Promise<Result<RelationshipTemplateDTO[]>> {
        return await this.getRealtionshipTemplatesUseCase.execute(request);
    }

    public async getRelationshipTemplate(request: GetRelationshipTemplateRequest): Promise<Result<RelationshipTemplateDTO>> {
        return await this.getRelationshipTemplateUseCase.execute(request);
    }

    public async createQrCodeForOwnTemplate(request: CreateQrCodeForOwnTemplateRequest): Promise<Result<CreateQrCodeForOwnTemplateResponse>> {
        return await this.createQrCodeForOwnTemplateUseCase.execute(request);
    }
}
