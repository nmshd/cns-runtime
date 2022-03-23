import { Result } from "@js-soft/ts-utils";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { UseCase } from "../../common";

export interface SyncDatawalletRequest {
    callback?(percentage: number, syncStep: string): void;
}

export class SyncDatawalletUseCase extends UseCase<SyncDatawalletRequest, void> {
    public constructor(@Inject private readonly accountController: AccountController) {
        super();
    }

    protected async executeInternal(request: SyncDatawalletRequest): Promise<Result<void>> {
        await this.accountController.syncDatawallet(true, request.callback);
        return Result.ok(undefined);
    }
}
