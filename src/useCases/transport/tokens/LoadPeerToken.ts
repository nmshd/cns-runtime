import { Result } from "@js-soft/ts-utils";
import { CryptoSecretKey } from "@nmshd/crypto";
import { AccountController, BackboneIds, CoreId, Token, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { TokenMapper } from "./TokenMapper";

export interface LoadPeerTokenRequest {
    id?: string;
    secretKey?: string;
    reference?: string;
    ephemeral: boolean;
}

class LoadPeerTokenRequestValidator extends RuntimeValidator<LoadPeerTokenRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x)
            .fulfills((x) => isCreateTokenFromIdAndKeyRequest(x) || isCreateTokenFromReferenceRequest(x))
            .withFailureCode(RuntimeErrors.general.invalidPayload().code)
            .withFailureMessage(RuntimeErrors.general.invalidPayload().message);

        this.setupRulesForCreateTokenFromReferenceRequest();
        this.setupRulesForCreateTokenFromIdAndKeyRequest();

        this.validateIfAny((x) => x.ephemeral).isNotNull();
    }

    private setupRulesForCreateTokenFromReferenceRequest() {
        this.validateIfString((x) => x.reference)
            .isNotNull()
            .when(isCreateTokenFromReferenceRequest);
    }

    private setupRulesForCreateTokenFromIdAndKeyRequest() {
        this.validateIfString((x) => x.id)
            .fulfills(IdValidator.required(BackboneIds.token))
            .when(isCreateTokenFromIdAndKeyRequest);

        this.validateIfString((x) => x.secretKey)
            .isNotNull()
            .when(isCreateTokenFromIdAndKeyRequest);
    }
}

function isCreateTokenFromReferenceRequest(request: LoadPeerTokenRequest): boolean {
    return !!request.reference;
}

function isCreateTokenFromIdAndKeyRequest(request: LoadPeerTokenRequest): boolean {
    return !!request.id && !!request.secretKey;
}

export class LoadPeerTokenUseCase extends UseCase<LoadPeerTokenRequest, TokenDTO> {
    public constructor(
        @Inject private readonly tokenController: TokenController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: LoadPeerTokenRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: LoadPeerTokenRequest): Promise<Result<TokenDTO>> {
        let createdToken: Token;

        if (request.id && request.secretKey) {
            const key = await CryptoSecretKey.fromBase64(request.secretKey);
            createdToken = await this.tokenController.loadPeerToken(CoreId.from(request.id), key, request.ephemeral);
        } else if (request.reference) {
            createdToken = await this.tokenController.loadPeerTokenByTruncated(request.reference, request.ephemeral);
        } else {
            return Result.fail(RuntimeErrors.general.invalidPayload());
        }

        if (!request.ephemeral) {
            await this.accountController.syncDatawallet();
        }

        return Result.ok(await TokenMapper.toTokenDTO(createdToken, request.ephemeral));
    }
}
