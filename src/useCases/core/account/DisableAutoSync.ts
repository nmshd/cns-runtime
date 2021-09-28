import { Result } from "@js-soft/ts-utils";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { UseCase } from "../../common";

export class DisableAutoSyncUseCase extends UseCase<void, void> {
    public constructor(@Inject private readonly accountController: AccountController) {
        super();
    }

    protected executeInternal(): Result<void> {
        this.accountController.disableAutoSync();
        return Result.ok(undefined);
    }
}
