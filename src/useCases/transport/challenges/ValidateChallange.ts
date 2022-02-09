import { Result } from "@js-soft/ts-utils";
import { CryptoSignature } from "@nmshd/crypto";
import { Challenge, ChallengeController, ChallengeSigned, CoreError } from "@nmshd/transport";
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
        const signatureResult = await this.parseSignature(request.signature);
        if (signatureResult.isError) return Result.fail(signatureResult.error);

        const validateChallengeResult = await this.validateChallenge(request.challenge);
        if (validateChallengeResult.isError) return Result.fail(validateChallengeResult.error);

        const signedChallenge = await ChallengeSigned.from({
            challenge: request.challenge,
            signature: signatureResult.value
        });

        try {
            const success = await this.challengeController.checkChallenge(signedChallenge);
            return Result.ok(success ? RelationshipMapper.toRelationshipDTO(success) : undefined);
        } catch (e: unknown) {
            if (!(e instanceof CoreError) || e.code !== "error.transport.notImplemented") throw e;

            return Result.fail(RuntimeErrors.general.featureNotImplemented("Validating challenges of the type 'Device' is not yet implemented."));
        }
    }

    private async parseSignature(signature: string): Promise<Result<CryptoSignature>> {
        try {
            const cryptoSignature = await CryptoSignature.fromBase64(signature);
            return Result.ok(cryptoSignature);
        } catch {
            return Result.fail(RuntimeErrors.challenges.invalidSignature());
        }
    }

    private async validateChallenge(challenge: string): Promise<Result<void>> {
        try {
            await Challenge.deserialize(challenge);
            return Result.ok(undefined);
        } catch {
            return Result.fail(RuntimeErrors.challenges.invalidChallenge());
        }
    }
}
