import { Result } from "@js-soft/ts-utils";
import { AnonymousTokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { TokenMapper } from "../../transport/tokens/TokenMapper";

export interface LoadPeerTokenAnonymousByTruncatedReferenceRequest {
    reference: string;
}

class LoadPeerTokenAnonymousByTruncatedReferenceRequestValidator extends RuntimeValidator<LoadPeerTokenAnonymousByTruncatedReferenceRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.reference).isNotNull();
    }
}

export class LoadPeerTokenAnonymousByTruncatedReferenceUseCase extends UseCase<LoadPeerTokenAnonymousByTruncatedReferenceRequest, TokenDTO> {
    public constructor(@Inject private readonly anonymousTokenController: AnonymousTokenController, @Inject validator: LoadPeerTokenAnonymousByTruncatedReferenceRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: LoadPeerTokenAnonymousByTruncatedReferenceRequest): Promise<Result<TokenDTO>> {
        const createdToken = await this.anonymousTokenController.loadPeerTokenByTruncated(request.reference);
        return Result.ok(TokenMapper.toTokenDTO(createdToken, true));
    }
}
