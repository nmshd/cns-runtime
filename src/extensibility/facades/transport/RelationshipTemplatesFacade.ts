import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { RelationshipTemplateDTO, TokenDTO } from "../../../types";
import {
    CreateOwnRelationshipTemplateRequest,
    CreateOwnRelationshipTemplateUseCase,
    CreateTokenForOwnTemplateRequest,
    CreateTokenForOwnTemplateUseCase,
    CreateTokenQrCodeForOwnTemplateRequest,
    CreateTokenQrCodeForOwnTemplateResponse,
    CreateTokenQrCodeForOwnTemplateUseCase,
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
        @Inject private readonly createTokenQrCodeForOwnTemplateUseCase: CreateTokenQrCodeForOwnTemplateUseCase,
        @Inject private readonly createTokenForOwnTemplateUseCase: CreateTokenForOwnTemplateUseCase
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

    public async createTokenQrCodeForOwnTemplate(request: CreateTokenQrCodeForOwnTemplateRequest): Promise<Result<CreateTokenQrCodeForOwnTemplateResponse>> {
        return await this.createTokenQrCodeForOwnTemplateUseCase.execute(request);
    }

    public async createTokenForOwnTemplate(request: CreateTokenForOwnTemplateRequest): Promise<Result<TokenDTO>> {
        return await this.createTokenForOwnTemplateUseCase.execute(request);
    }
}
