import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreId, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { TokenMapper } from "./TokenMapper";

export interface GetTokenRequest {
    id: string;
}

class GetTokenRequestValidator extends RuntimeValidator<GetTokenRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(BackboneIds.token));
    }
}

export class GetTokenUseCase extends UseCase<GetTokenRequest, TokenDTO> {
    public constructor(@Inject private readonly tokenController: TokenController, @Inject validator: GetTokenRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetTokenRequest): Promise<Result<TokenDTO>> {
        const token = await this.tokenController.getToken(CoreId.from(request.id));
        if (!token) {
            return Result.fail(RuntimeErrors.general.recordNotFound("Token"));
        }

        return Result.ok(TokenMapper.toTokenDTO(token, false));
    }
}
