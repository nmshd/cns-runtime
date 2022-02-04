import { ApplicationError, Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { ChallengeDTO } from "../../../types";
import { CreateChallengeRequest, CreateChallengeUseCase } from "../../../useCases";

export class ChallengesFacade {
    public constructor(@Inject private readonly createChallengeUseCase: CreateChallengeUseCase) {}

    public async createChallenge(request: CreateChallengeRequest): Promise<Result<ChallengeDTO, ApplicationError>> {
        return await this.createChallengeUseCase.execute(request);
    }
}
