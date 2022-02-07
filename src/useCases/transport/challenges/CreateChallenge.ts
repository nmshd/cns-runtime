import { Result } from "@js-soft/ts-utils";
import { ChallengeController, ChallengeType, CoreId, Relationship, RelationshipsController } from "@nmshd/transport";
import { ValidationFailure, ValidationResult } from "fluent-ts-validator";
import { Inject } from "typescript-ioc";
import { ChallengeDTO } from "../../../types";
import { JsonSchema, RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { ChallengeMapper } from "./ChallengeMapper";

export interface CreateRelationshipChallengeRequest {
    challengeType: "Relationship";
    /**
     * @format relationshipId
     */
    relationship: string;
}

function isCreateRelationshipChallengeRequest(value: any): value is CreateRelationshipChallengeRequest {
    return value.challengeType === "Relationship" && typeof value.relationship === "string";
}

export interface CreateIdentityChallengeRequest {
    challengeType: "Identity";
}

function isCreateIdentityChallengeRequest(value: any): value is CreateIdentityChallengeRequest {
    return value.challengeType === "Identity";
}

export interface CreateDeviceChallengeRequest {
    challengeType: "Device";
}

function isCreateDeviceChallengeRequest(value: any): value is CreateDeviceChallengeRequest {
    return value.challengeType === "Device";
}

export type CreateChallengeRequest = CreateRelationshipChallengeRequest | CreateIdentityChallengeRequest | CreateDeviceChallengeRequest;

class Validator extends SchemaValidator<CreateChallengeRequest> {
    private readonly relationshipSchema: JsonSchema;
    private readonly identitySchema: JsonSchema;
    private readonly deviceSchema: JsonSchema;

    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("CreateChallengeRequest"));
        this.relationshipSchema = schemaRepository.getSchema("CreateRelationshipChallengeRequest");
        this.identitySchema = schemaRepository.getSchema("CreateIdentityChallengeRequest");
        this.deviceSchema = schemaRepository.getSchema("CreateDeviceChallengeRequest");
    }

    public validate(input: CreateChallengeRequest): ValidationResult {
        if (this.schema.validate(input).isValid) return new ValidationResult();

        if (isCreateRelationshipChallengeRequest(input)) {
            return this.convertValidationResult(this.relationshipSchema.validate(input));
        } else if (isCreateIdentityChallengeRequest(input)) {
            return this.convertValidationResult(this.identitySchema.validate(input));
        } else if (isCreateDeviceChallengeRequest(input)) {
            return this.convertValidationResult(this.deviceSchema.validate(input));
        }

        const result = new ValidationResult();
        result.addFailures([new ValidationFailure(undefined, "", undefined, RuntimeErrors.general.invalidPayload().code, RuntimeErrors.general.invalidPayload().message)]);
        return result;
    }
}

export class CreateChallengeUseCase extends UseCase<CreateChallengeRequest, ChallengeDTO> {
    public constructor(
        @Inject private readonly challengeController: ChallengeController,
        @Inject private readonly relationshipsController: RelationshipsController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateChallengeRequest): Promise<Result<ChallengeDTO>> {
        const relationshipResult = await this.getRelationship(request);
        if (relationshipResult.isError) return Result.fail(relationshipResult.error);

        let challengeType: ChallengeType;
        switch (request.challengeType) {
            case "Relationship":
                challengeType = ChallengeType.Relationship;
                break;
            case "Identity":
                challengeType = ChallengeType.Identity;
                break;
            case "Device":
                challengeType = ChallengeType.Device;
                break;
            default:
                throw new Error("Unknown challenge type.");
        }

        const signedChallenge = await this.challengeController.createChallenge(challengeType, relationshipResult.value);

        return Result.ok(ChallengeMapper.toChallengeDTO(signedChallenge));
    }

    private async getRelationship(request: CreateChallengeRequest): Promise<Result<Relationship | undefined>> {
        if (!isCreateRelationshipChallengeRequest(request)) return Result.ok(undefined);

        const relationship = await this.relationshipsController.getRelationship(CoreId.from(request.relationship));
        if (!relationship) return Result.fail(RuntimeErrors.general.recordNotFound(Relationship));

        return Result.ok(relationship);
    }
}
