import { Result } from "@js-soft/ts-utils";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { UseCase } from "../../common";

export interface SyncInfo {
    lastDatawalletSync?: {
        completedAt: string;
    };
    lastSyncRun?: {
        completedAt: string;
    };
}

export class GetSyncInfoUseCase extends UseCase<void, SyncInfo> {
    public constructor(@Inject private readonly accountController: AccountController) {
        super();
    }

    protected async executeInternal(): Promise<Result<SyncInfo>> {
        const syncEverythingTime = await this.accountController.getLastCompletedSyncTime();
        const syncDatawalletTime = await this.accountController.getLastCompletedDatawalletSyncTime();

        return Result.ok({
            lastSyncRun: syncEverythingTime ? { completedAt: syncEverythingTime.toISOString() } : undefined,
            lastDatawalletSync: syncDatawalletTime ? { completedAt: syncDatawalletTime.toISOString() } : undefined
        });
    }
}
