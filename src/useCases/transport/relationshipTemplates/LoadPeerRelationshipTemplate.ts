import { EventBus, Result } from "@js-soft/ts-utils";
import { CryptoSecretKey } from "@nmshd/crypto";
import { AccountController, CoreId, RelationshipTemplateController, Token, TokenContentRelationshipTemplate, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { PeerRelationshipTemplateLoadedEvent } from "../../../events";
import { RelationshipTemplateDTO } from "../../../types";
import { RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { RelationshipTemplateMapper } from "./RelationshipTemplateMapper";

export interface LoadPeerRelationshipTemplateRequestFromIdAndKeyRequest {
    /**
     * @pattern RLT[A-Za-z0-9]{17}
     */
    id: string;
    secretKey: string;
}

export interface LoadPeerRelationshipTemplateRequestFromTokenReferenceRequest {
    tokenReference: string;
}

export interface LoadPeerRelationshipTemplateRequestFromRelationshipTemplateReferenceRequest {
    relationshipTemplateReference: string;
}

export type LoadPeerRelationshipTemplateRequest =
    | LoadPeerRelationshipTemplateRequestFromIdAndKeyRequest
    | LoadPeerRelationshipTemplateRequestFromTokenReferenceRequest
    | LoadPeerRelationshipTemplateRequestFromRelationshipTemplateReferenceRequest;

class Validator extends SchemaValidator<LoadPeerRelationshipTemplateRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("LoadPeerRelationshipTemplateRequest"));
    }
}

export class LoadPeerRelationshipTemplateUseCase extends UseCase<LoadPeerRelationshipTemplateRequest, RelationshipTemplateDTO> {
    public constructor(
        @Inject private readonly templateController: RelationshipTemplateController,
        @Inject private readonly tokenController: TokenController,
        @Inject private readonly accountController: AccountController,
        @Inject private readonly eventBus: EventBus,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: LoadPeerRelationshipTemplateRequest): Promise<Result<RelationshipTemplateDTO>> {
        let createdTemplateResult: Result<RelationshipTemplateDTO>;

        if (isLoadPeerRelationshipTemplateRequestFromIdAndKeyRequest(request)) {
            const key = CryptoSecretKey.fromBase64(request.secretKey);
            createdTemplateResult = await this.loadTemplate(CoreId.from(request.id), key);
        } else if (isLoadPeerRelationshipTemplateRequestFromTokenReferenceRequest(request)) {
            createdTemplateResult = await this.loadRelationshipTemplateFromTokenReference(request.tokenReference);
        } else if (isLoadPeerRelationshipTemplateRequestFromRelationshipTemplateReferenceRequest(request)) {
            createdTemplateResult = await this.loadRelationshipTemplateFromRelationshipTemplateReference(request.relationshipTemplateReference);
        } else {
            throw new Error("Invalid request format.");
        }

        await this.accountController.syncDatawallet();

        if (createdTemplateResult.isSuccess) {
            const event = new PeerRelationshipTemplateLoadedEvent(this.accountController.identity.address.address, createdTemplateResult.value);
            this.eventBus.publish(event);
        }

        return createdTemplateResult;
    }

    private async loadRelationshipTemplateFromTokenReference(reference: string): Promise<Result<RelationshipTemplateDTO>> {
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

    private async loadRelationshipTemplateFromRelationshipTemplateReference(relationshipTemplateReference: string) {
        const template = await this.templateController.loadPeerRelationshipTemplateByTruncated(relationshipTemplateReference);
        return Result.ok(RelationshipTemplateMapper.toRelationshipTemplateDTO(template));
    }

    private async loadTemplate(id: CoreId, key: CryptoSecretKey) {
        const template = await this.templateController.loadPeerRelationshipTemplate(id, key);
        return Result.ok(RelationshipTemplateMapper.toRelationshipTemplateDTO(template));
    }
}

function isLoadPeerRelationshipTemplateRequestFromIdAndKeyRequest(x: any): x is LoadPeerRelationshipTemplateRequestFromIdAndKeyRequest {
    return !!x.id && !!x.secretKey;
}

function isLoadPeerRelationshipTemplateRequestFromTokenReferenceRequest(x: any): x is LoadPeerRelationshipTemplateRequestFromTokenReferenceRequest {
    return !!x.tokenReference;
}

function isLoadPeerRelationshipTemplateRequestFromRelationshipTemplateReferenceRequest(x: any): x is LoadPeerRelationshipTemplateRequestFromRelationshipTemplateReferenceRequest {
    return !!x.relationshipTemplateReference;
}
