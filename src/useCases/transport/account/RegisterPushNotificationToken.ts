import { Result } from "@js-soft/ts-utils";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RuntimeValidator, UseCase } from "../../common";

export interface RegisterPushNotificationTokenRequest {
    handle: string;
    installationId: string;
    platform: string;
}

class Validator extends RuntimeValidator<RegisterPushNotificationTokenRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.handle)
            .isDefined()
            .isNotEmpty();

        this.validateIfString((x) => x.installationId)
            .isDefined()
            .isNotEmpty();

        this.validateIfString((x) => x.platform)
            .isDefined()
            .isNotEmpty();
    }
}

export class RegisterPushNotificationTokenUseCase extends UseCase<RegisterPushNotificationTokenRequest, void> {
    public constructor(@Inject private readonly accountController: AccountController, @Inject validator: Validator) {
        super(validator);
    }

    protected async executeInternal(request: RegisterPushNotificationTokenRequest): Promise<Result<void>> {
        await this.accountController.registerPushNotificationToken({
            handle: request.handle,
            installationId: request.installationId,
            platform: request.platform
        });

        return Result.ok(undefined);
    }
}
