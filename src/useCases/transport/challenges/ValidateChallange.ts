import { Result } from "@js-soft/ts-utils";
import { CryptoSignature } from "@nmshd/crypto";
import { ChallengeController, ChallengeSigned, CoreError } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RelationshipMapper } from "..";
import { RelationshipDTO } from "../../../types";
import { RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";

export interface ValidateChallengeRequest {
    challenge: string;
    signature: string;
}

class Validator extends SchemaValidator<ValidateChallengeRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("ValidateChallengeRequest"));
    }
}

export class ValidateChallengeUseCase extends UseCase<ValidateChallengeRequest, RelationshipDTO | undefined> {
    public constructor(@Inject private readonly challengeController: ChallengeController, @Inject validator: Validator) {
        super(validator);
    }

    protected async executeInternal(request: ValidateChallengeRequest): Promise<Result<RelationshipDTO | undefined>> {
        const signature = await CryptoSignature.fromBase64(request.signature);
        const signedChallenge = await ChallengeSigned.from({ challenge: request.challenge, signature: signature });

        try {
            const success = await this.challengeController.checkChallenge(signedChallenge);
            return Result.ok(success ? RelationshipMapper.toRelationshipDTO(success) : undefined);
        } catch (e: unknown) {
            if (!(e instanceof CoreError) || e.code !== "error.transport.notImplemented") throw e;

            return Result.fail(RuntimeErrors.general.featureNotImplemented("Validating challenges of the type 'Device' is not yet implemented."));
        }
    }
}
