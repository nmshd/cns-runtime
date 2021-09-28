import { Result } from "@js-soft/ts-utils";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { UseCase } from "../../common";

export class SyncDatawalletUseCase extends UseCase<void, void> {
    public constructor(@Inject private readonly accountController: AccountController) {
        super();
    }

    protected async executeInternal(): Promise<Result<void>> {
        await this.accountController.syncDatawallet(true);
        return Result.ok(undefined);
    }
}
