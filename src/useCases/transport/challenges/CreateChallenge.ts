import { Result } from "@js-soft/ts-utils";
import { BackboneIds, ChallengeController, ChallengeType, CoreId, Relationship, RelationshipsController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ChallengeDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { ChallengeMapper } from "./ChallengeMapper";

export interface CreateChallengeRequest {
    relationship?: string;
    challengeType?: string;
}

class Validator extends RuntimeValidator<CreateChallengeRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.challengeType)
            .isIn(Object.keys(ChallengeType))
            .whenDefined();

        this.validateIfString((x) => x.relationship).fulfills(IdValidator.optional(BackboneIds.relationship));
        this.validateIfString((x) => x.relationship)
            .fulfills(IdValidator.required(BackboneIds.relationship))
            .when((x) => x.challengeType === ChallengeType.Relationship)
            .withFailureMessage("'relationship' is required when 'challengeType' is 'Relationship'");
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

        const signedChallenge = await this.challengeController.createChallenge(request.challengeType as ChallengeType, relationshipResult.value);

        return Result.ok(ChallengeMapper.toChallengeDTO(signedChallenge));
    }

    private async getRelationship(request: CreateChallengeRequest): Promise<Result<Relationship | undefined>> {
        if (!request.relationship) return Result.ok(undefined);

        const relationship = await this.relationshipsController.getRelationship(CoreId.from(request.relationship));
        if (!relationship) return Result.fail(RuntimeErrors.general.recordNotFound(Relationship));

        return Result.ok(relationship);
    }
}
