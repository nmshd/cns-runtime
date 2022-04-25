import { Result } from "@js-soft/ts-utils";
import { CryptoSignature } from "@nmshd/crypto";
import { Challenge, ChallengeController, ChallengeSigned, CoreError } from "@nmshd/transport";
import { ValidationFailure, ValidationResult } from "fluent-ts-validator";
import { Inject } from "typescript-ioc";
import { RelationshipDTO } from "../../../types";
import { RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { RelationshipMapper } from "../relationships/RelationshipMapper";

export interface ValidateChallengeRequest {
    challengeString: string;
    signature: string;
}

export interface ValidateChallengeResponse {
    isValid: boolean;
    correspondingRelationship?: RelationshipDTO;
}

class Validator extends SchemaValidator<ValidateChallengeRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("ValidateChallengeRequest"));
    }

    public async validate(value: ValidateChallengeRequest): Promise<ValidationResult> {
        const validationResult = await super.validate(value);
        if (validationResult.isInvalid()) return validationResult;

        const signatureValidationResult = this.validateSignature(value.signature);
        if (signatureValidationResult.isError) {
            validationResult.addFailures([new ValidationFailure(undefined, "signature", undefined, undefined, signatureValidationResult.error.message)]);
        }

        const challengeValidationResult = this.validateChallenge(value.challengeString);
        if (challengeValidationResult.isError) {
            validationResult.addFailures([new ValidationFailure(undefined, "challenge", undefined, undefined, challengeValidationResult.error.message)]);
        }

        return validationResult;
    }

    private validateSignature(signature: string): Result<void> {
        try {
            CryptoSignature.fromBase64(signature);
            return Result.ok(undefined);
        } catch {
            return Result.fail(RuntimeErrors.challenges.invalidSignature());
        }
    }

    private validateChallenge(challenge: string): Result<void> {
        try {
            Challenge.deserialize(challenge);
            return Result.ok(undefined);
        } catch {
            return Result.fail(RuntimeErrors.challenges.invalidChallengeString());
        }
    }
}

export class ValidateChallengeUseCase extends UseCase<ValidateChallengeRequest, ValidateChallengeResponse> {
    public constructor(@Inject private readonly challengeController: ChallengeController, @Inject validator: Validator) {
        super(validator);
    }

    protected async executeInternal(request: ValidateChallengeRequest): Promise<Result<ValidateChallengeResponse>> {
        const signature = CryptoSignature.fromBase64(request.signature);
        const signedChallenge = ChallengeSigned.from({
            challenge: request.challengeString,
            signature: signature
        });

        try {
            const success = await this.challengeController.validateChallenge(signedChallenge);

            const correspondingRelationship = success.correspondingRelationship ? RelationshipMapper.toRelationshipDTO(success.correspondingRelationship) : undefined;
            return Result.ok({
                isValid: success.isValid,
                correspondingRelationship
            });
        } catch (e: unknown) {
            if (!(e instanceof CoreError) || e.code !== "error.transport.notImplemented") throw e;

            return Result.fail(RuntimeErrors.general.featureNotImplemented("Validating challenges of the type 'Device' is not yet implemented."));
        }
    }
}
