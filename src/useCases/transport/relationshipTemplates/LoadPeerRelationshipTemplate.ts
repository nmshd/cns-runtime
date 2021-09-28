import { Result } from "@js-soft/ts-utils";
import { CryptoSecretKey } from "@nmshd/crypto";
import { AccountController, BackboneIds, CoreId, RelationshipTemplateController, Token, TokenContentRelationshipTemplate, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RelationshipTemplateDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { RelationshipTemplateMapper } from "./RelationshipTemplateMapper";

export interface LoadPeerRelationshipTemplateRequest {
    id?: string;
    secretKey?: string;
    reference?: string;
}

class LoadPeerRelationshipTemplateRequestValidator extends RuntimeValidator<LoadPeerRelationshipTemplateRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x)
            .fulfills((x) => this.isCreateRelationshipTemplateFromIdAndKeyRequest(x) || this.isCreateRelationshipTemplateFromTokenReferenceRequest(x))
            .withFailureCode(RuntimeErrors.general.invalidPayload().code)
            .withFailureMessage(RuntimeErrors.general.invalidPayload().message);

        this.setupRulesForCreateRelationshipTemplateFromIdAndKeyRequest();
        this.setupRulesForCreateRelationshipTemplateFromTokenReferenceRequest();
    }

    private setupRulesForCreateRelationshipTemplateFromIdAndKeyRequest() {
        this.validateIfString((x) => x.id)
            .fulfills(IdValidator.required(BackboneIds.relationshipTemplate))
            .when(this.isCreateRelationshipTemplateFromIdAndKeyRequest);

        this.validateIfString((x) => x.secretKey)
            .isNotNull()
            .when(this.isCreateRelationshipTemplateFromIdAndKeyRequest);
    }

    private setupRulesForCreateRelationshipTemplateFromTokenReferenceRequest() {
        this.validateIfString((x) => x.reference)
            .isNotNull()
            .when(this.isCreateRelationshipTemplateFromTokenReferenceRequest);
    }
    private isCreateRelationshipTemplateFromIdAndKeyRequest(x: LoadPeerRelationshipTemplateRequest): boolean {
        return !!x.id && !!x.secretKey;
    }

    private isCreateRelationshipTemplateFromTokenReferenceRequest(x: LoadPeerRelationshipTemplateRequest): boolean {
        return !!x.reference;
    }
}

export class LoadPeerRelationshipTemplateUseCase extends UseCase<LoadPeerRelationshipTemplateRequest, RelationshipTemplateDTO> {
    public constructor(
        @Inject private readonly templateController: RelationshipTemplateController,
        @Inject private readonly tokenController: TokenController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: LoadPeerRelationshipTemplateRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: LoadPeerRelationshipTemplateRequest): Promise<Result<RelationshipTemplateDTO>> {
        let createdTemplate: Result<RelationshipTemplateDTO>;

        if (request.id && request.secretKey) {
            const key = await CryptoSecretKey.fromBase64(request.secretKey);
            createdTemplate = await this.loadTemplate(CoreId.from(request.id), key);
        } else if (request.reference) {
            createdTemplate = await this.createRelationshipTemplateFromTokenReferenceRequest(request.reference);
        } else {
            throw new Error("Invalid request format.");
        }

        await this.accountController.syncDatawallet();

        return createdTemplate;
    }

    private async createRelationshipTemplateFromTokenReferenceRequest(reference: string): Promise<Result<RelationshipTemplateDTO>> {
        const token = await this.tokenController.loadPeerTokenByTruncated(reference, true);

        if (!token.cache) {
            throw RuntimeErrors.general.cacheEmpty(Token, token.id.toString());
        }

        if (!(token.cache.content instanceof TokenContentRelationshipTemplate)) {
            return Result.fail(RuntimeErrors.general.invalidTokenContent());
        }

        const content = token.cache.content;
        return await this.loadTemplate(content.templateId, content.secretKey);
    }

    private async loadTemplate(id: CoreId, key: CryptoSecretKey) {
        const template = await this.templateController.loadPeerRelationshipTemplate(id, key);
        return Result.ok(RelationshipTemplateMapper.toRelationshipTemplateDTO(template));
    }
}
