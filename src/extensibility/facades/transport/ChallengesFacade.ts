import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { ChallengeDTO, RelationshipDTO } from "../../../types";
import { CreateChallengeRequest, CreateChallengeUseCase } from "../../../useCases";
import { ValidateChallengeRequest, ValidateChallengeUseCase } from "../../../useCases/transport/challenges/ValidateChallange";

export class ChallengesFacade {
    public constructor(@Inject private readonly createChallengeUseCase: CreateChallengeUseCase, @Inject private readonly validateChallengeUseCase: ValidateChallengeUseCase) {}

    public async createChallenge(request: CreateChallengeRequest): Promise<Result<ChallengeDTO>> {
        return await this.createChallengeUseCase.execute(request);
    }

    public async validateChallenge(request: ValidateChallengeRequest): Promise<Result<RelationshipDTO | undefined>> {
        return await this.validateChallengeUseCase.execute(request);
    }
}
