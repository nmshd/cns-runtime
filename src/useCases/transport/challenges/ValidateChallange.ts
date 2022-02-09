import { Result } from "@js-soft/ts-utils";
import { CryptoSignature } from "@nmshd/crypto";
import { Challenge, ChallengeController, ChallengeSigned, CoreError } from "@nmshd/transport";
import { ValidationFailure, ValidationResult } from "fluent-ts-validator";
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

    public async validate(value: ValidateChallengeRequest): Promise<ValidationResult> {
        const validationResult = await super.validate(value);
        if (validationResult.isInvalid()) return validationResult;

        const signature = await this.validateSignature(value.signature);
        if (signature.isError) validationResult.addFailures([new ValidationFailure(undefined, "signature", undefined, undefined, signature.error.message)]);

        const challenge = await this.validateChallenge(value.challenge);
        if (challenge.isError) validationResult.addFailures([new ValidationFailure(undefined, "challenge", undefined, undefined, challenge.error.message)]);

        return validationResult;
    }

    private async validateSignature(signature: string): Promise<Result<void>> {
        try {
            await CryptoSignature.fromBase64(signature);
            return Result.ok(undefined);
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

export class ValidateChallengeUseCase extends UseCase<ValidateChallengeRequest, RelationshipDTO | undefined> {
    public constructor(@Inject private readonly challengeController: ChallengeController, @Inject validator: Validator) {
        super(validator);
    }

    protected async executeInternal(request: ValidateChallengeRequest): Promise<Result<RelationshipDTO | undefined>> {
        const signature = await CryptoSignature.fromBase64(request.signature);
        const signedChallenge = await ChallengeSigned.from({
            challenge: request.challenge,
            signature: signature
        });

        try {
            const success = await this.challengeController.checkChallenge(signedChallenge);
            return Result.ok(success ? RelationshipMapper.toRelationshipDTO(success) : undefined);
        } catch (e: unknown) {
            if (!(e instanceof CoreError) || e.code !== "error.transport.notImplemented") throw e;

            return Result.fail(RuntimeErrors.general.featureNotImplemented("Validating challenges of the type 'Device' is not yet implemented."));
        }
    }
}
