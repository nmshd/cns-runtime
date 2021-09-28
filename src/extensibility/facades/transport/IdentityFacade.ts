import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { CheckIdentityRequest, CheckIdentityResponse, CheckIdentityUseCase } from "../../../useCases";

export class IdentityFacade {
    public constructor(@Inject private readonly checkIdentityUseCase: CheckIdentityUseCase) {}

    public async checkIdentity(request: CheckIdentityRequest): Promise<Result<CheckIdentityResponse>> {
        return await this.checkIdentityUseCase.execute(request);
    }
}
