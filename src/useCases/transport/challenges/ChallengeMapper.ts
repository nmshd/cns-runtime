import { ChallengeSigned } from "@nmshd/transport";
import { ChallengeDTO } from "../../../types";

export class ChallengeMapper {
    public static toChallengeDTO(signedChallenge: ChallengeSigned): ChallengeDTO {
        const challenge = JSON.parse(signedChallenge.challenge);
        return {
            id: challenge.id,
            expiresAt: challenge.expiresAt,
            createdBy: challenge.createdBy,
            createdByDevice: challenge.createdByDevice,
            type: challenge.type,
            signature: signedChallenge.signature.toBase64(),
            challengeString: signedChallenge.challenge
        };
    }
}
