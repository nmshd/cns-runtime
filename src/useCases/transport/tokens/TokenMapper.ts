import { Token } from "@nmshd/transport";
import { TokenDTO } from "../../../types";
import { RuntimeErrors } from "../../common";

export class TokenMapper {
    public static async toTokenDTO(token: Token, ephemeral: boolean): Promise<TokenDTO> {
        if (!token.cache) {
            throw RuntimeErrors.general.cacheEmpty(Token, token.id.toString());
        }

        const reference = await token.toTokenReference();
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

    public static async toTokenDTOList(tokens: Token[], ephemeral: boolean): Promise<TokenDTO[]> {
        return await Promise.all(tokens.map((t) => TokenMapper.toTokenDTO(t, ephemeral)));
    }
}
