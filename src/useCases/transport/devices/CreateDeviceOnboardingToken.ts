import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreDate, CoreId, DevicesController, TokenContentDeviceSharedSecret, TokenController } from "@nmshd/transport";
import { DateTime } from "luxon";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import { IdValidator, RuntimeValidator, UseCase } from "../../common";
import { TokenMapper } from "../tokens/TokenMapper";

export interface CreateDeviceOnboardingTokenRequest {
    id: string;
    expiresAt?: string;
}

class CreateDeviceOnboardingTokenRequestValidator extends RuntimeValidator<CreateDeviceOnboardingTokenRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(BackboneIds.device));

        this.validateIf((x) => x.expiresAt)
            .fulfills((e) => DateTime.fromISO(e) > DateTime.utc())
            .whenNotNull()
            .withFailureMessage("'$propertyName' must be in the future.");
    }
}

export class CreateDeviceOnboardingTokenUseCase extends UseCase<CreateDeviceOnboardingTokenRequest, TokenDTO> {
    public constructor(
        @Inject private readonly devicesController: DevicesController,
        @Inject private readonly tokenController: TokenController,
        @Inject validator: CreateDeviceOnboardingTokenRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateDeviceOnboardingTokenRequest): Promise<Result<TokenDTO>> {
        const sharedSecret = await this.devicesController.getSharedSecret(CoreId.from(request.id));
        const expiresAt = request.expiresAt ? CoreDate.from(request.expiresAt) : CoreDate.utc().add({ minutes: 5 });

        const tokenContent = await TokenContentDeviceSharedSecret.from({ sharedSecret: sharedSecret });
        const token = await this.tokenController.sendToken({
            content: tokenContent,
            expiresAt: expiresAt,
            ephemeral: true
        });

        return Result.ok(await TokenMapper.toTokenDTO(token, true));
    }
}
