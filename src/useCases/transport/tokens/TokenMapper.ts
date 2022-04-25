import { Token } from "@nmshd/transport";
import { TokenDTO } from "../../../types";
import { RuntimeErrors } from "../../common";

export class TokenMapper {
    public static toTokenDTO(token: Token, ephemeral: boolean): TokenDTO {
        if (!token.cache) {
            throw RuntimeErrors.general.cacheEmpty(Token, token.id.toString());
        }

        const reference = token.toTokenReference();
        return {
            id: token.id.toString(),
            createdBy: token.cache.createdBy.toString(),
            createdByDevice: token.cache.createdByDevice.toString(),
            content: token.cache.content.toJSON(),
            createdAt: token.cache.createdAt.toString(),
            expiresAt: token.cache.expiresAt.toString(),
            secretKey: token.secretKey.toBase64(),
            truncatedReference: reference.truncate(),
            isEphemeral: ephemeral
        };
    }

    public static toTokenDTOList(tokens: Token[], ephemeral: boolean): TokenDTO[] {
        return tokens.map((t) => TokenMapper.toTokenDTO(t, ephemeral));
    }
}
