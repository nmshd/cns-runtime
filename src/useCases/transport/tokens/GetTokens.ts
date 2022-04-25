import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { Result } from "@js-soft/ts-utils";
import { CachedToken, Token, TokenController } from "@nmshd/transport";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import { OwnerRestriction, RuntimeValidator, UseCase } from "../../common";
import { TokenMapper } from "./TokenMapper";

export interface GetTokensRequest {
    query?: any;
    ownerRestriction?: OwnerRestriction;
}

export class GetTokensUseCase extends UseCase<GetTokensRequest, TokenDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            [nameof<TokenDTO>((t) => t.createdAt)]: true,
            [nameof<TokenDTO>((t) => t.createdBy)]: true,
            [nameof<TokenDTO>((t) => t.createdByDevice)]: true,
            [nameof<TokenDTO>((t) => t.expiresAt)]: true
        },
        alias: {
            [nameof<TokenDTO>((t) => t.createdAt)]: `${nameof<Token>((t) => t.cache)}.${[nameof<CachedToken>((t) => t.createdAt)]}`,
            [nameof<TokenDTO>((t) => t.createdBy)]: `${nameof<Token>((t) => t.cache)}.${[nameof<CachedToken>((t) => t.createdBy)]}`,
            [nameof<TokenDTO>((t) => t.createdByDevice)]: `${nameof<Token>((t) => t.cache)}.${[nameof<CachedToken>((t) => t.createdByDevice)]}`,
            [nameof<TokenDTO>((t) => t.expiresAt)]: `${nameof<Token>((t) => t.cache)}.${[nameof<CachedToken>((t) => t.expiresAt)]}`
        }
    });

    public constructor(@Inject private readonly tokenController: TokenController, @Inject validator: RuntimeValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetTokensRequest): Promise<Result<TokenDTO[]>> {
        const query = GetTokensUseCase.queryTranslator.parse(request.query);

        if (request.ownerRestriction) {
            query[nameof<Token>((t) => t.isOwn)] = request.ownerRestriction === OwnerRestriction.Own;
        }

        const tokens = await this.tokenController.getTokens(query);
        return Result.ok(TokenMapper.toTokenDTOList(tokens, false));
    }
}
