import { ApplicationError, Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import {
    LoadPeerTokenAnonymousByIdAndKeyRequest,
    LoadPeerTokenAnonymousByIdAndKeyUseCase,
    LoadPeerTokenAnonymousByTruncatedReferenceRequest,
    LoadPeerTokenAnonymousByTruncatedReferenceUseCase
} from "../../../useCases";

export class AnonymousTokensFacade {
    public constructor(
        @Inject private readonly loadPeerTokenByTruncatedReferenceUseCase: LoadPeerTokenAnonymousByTruncatedReferenceUseCase,
        @Inject private readonly loadPeerTokenByIdAndKeyUseCase: LoadPeerTokenAnonymousByIdAndKeyUseCase
    ) {}

    public async loadPeerTokenByTruncatedReference(request: LoadPeerTokenAnonymousByTruncatedReferenceRequest): Promise<Result<TokenDTO, ApplicationError>> {
        return await this.loadPeerTokenByTruncatedReferenceUseCase.execute(request);
    }

    public async loadPeerTokenByIdAndKey(request: LoadPeerTokenAnonymousByIdAndKeyRequest): Promise<Result<TokenDTO, ApplicationError>> {
        return await this.loadPeerTokenByIdAndKeyUseCase.execute(request);
    }
}
