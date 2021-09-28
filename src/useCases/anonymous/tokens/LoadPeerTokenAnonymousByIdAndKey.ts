import { Result } from "@js-soft/ts-utils";
import { CryptoSecretKey } from "@nmshd/crypto";
import { AnonymousTokenController, BackboneIds, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import { IdValidator, RuntimeValidator, UseCase } from "../../common";
import { TokenMapper } from "../../core/tokens/TokenMapper";

export interface LoadPeerTokenAnonymousByIdAndKeyRequest {
    id: string;
    secretKey: string;
}

class LoadPeerTokenAnonymousByIdAndKeyRequestValidator extends RuntimeValidator<LoadPeerTokenAnonymousByIdAndKeyRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(BackboneIds.token));
        this.validateIfString((x) => x.secretKey).isNotNull();
    }
}

export class LoadPeerTokenAnonymousByIdAndKeyUseCase extends UseCase<LoadPeerTokenAnonymousByIdAndKeyRequest, TokenDTO> {
    public constructor(@Inject private readonly anonymousTokenController: AnonymousTokenController, @Inject validator: LoadPeerTokenAnonymousByIdAndKeyRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: LoadPeerTokenAnonymousByIdAndKeyRequest): Promise<Result<TokenDTO>> {
        const key = await CryptoSecretKey.fromBase64(request.secretKey);
        const createdToken = await this.anonymousTokenController.loadPeerToken(CoreId.from(request.id), key);

        return Result.ok(await TokenMapper.toTokenDTO(createdToken, true));
    }
}
