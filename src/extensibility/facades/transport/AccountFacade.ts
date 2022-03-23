import { ApplicationError, Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { DeviceDTO } from "../../../types";
import {
    DisableAutoSyncUseCase,
    EnableAutoSyncUseCase,
    GetDeviceInfoUseCase,
    GetIdentityInfoResponse,
    GetIdentityInfoUseCase,
    GetSyncInfoUseCase,
    RegisterPushNotificationTokenRequest,
    RegisterPushNotificationTokenUseCase,
    RuntimeErrors,
    SyncDatawalletRequest,
    SyncDatawalletUseCase,
    SyncEverythingRequest,
    SyncEverythingResponse,
    SyncEverythingUseCase,
    SyncInfo
} from "../../../useCases";

export class AccountFacade {
    public constructor(
        @Inject private readonly getIdentityInfoUseCase: GetIdentityInfoUseCase,
        @Inject private readonly getDeviceInfoUseCase: GetDeviceInfoUseCase,
        @Inject private readonly registerPushNotificationTokenUseCase: RegisterPushNotificationTokenUseCase,
        @Inject private readonly syncDatawalletUseCase: SyncDatawalletUseCase,
        @Inject private readonly syncEverythingUseCase: SyncEverythingUseCase,
        @Inject private readonly getSyncInfoUseCase: GetSyncInfoUseCase,
        @Inject private readonly disableAutoSyncUseCase: DisableAutoSyncUseCase,
        @Inject private readonly enableAutoSyncUseCase: EnableAutoSyncUseCase
    ) {}

    public async getIdentityInfo(): Promise<Result<GetIdentityInfoResponse, ApplicationError>> {
        return await this.getIdentityInfoUseCase.execute();
    }

    public async getDeviceInfo(): Promise<Result<DeviceDTO, ApplicationError>> {
        return await this.getDeviceInfoUseCase.execute();
    }

    public createDeviceBackup(): Promise<void> {
        throw RuntimeErrors.general.notImplemented();
    }

    public recoverDevice(): void {
        throw RuntimeErrors.general.notImplemented();
    }

    public async registerPushNotificationToken(request: RegisterPushNotificationTokenRequest): Promise<Result<void, ApplicationError>> {
        return await this.registerPushNotificationTokenUseCase.execute(request);
    }

    public async syncDatawallet(request: SyncDatawalletRequest = {}): Promise<Result<void, ApplicationError>> {
        return await this.syncDatawalletUseCase.execute(request);
    }

    public async syncEverything(request: SyncEverythingRequest = {}): Promise<Result<SyncEverythingResponse, ApplicationError>> {
        return await this.syncEverythingUseCase.execute(request);
    }

    public async getSyncInfo(): Promise<Result<SyncInfo, ApplicationError>> {
        return await this.getSyncInfoUseCase.execute();
    }

    public async enableAutoSync(): Promise<Result<void, ApplicationError>> {
        return await this.enableAutoSyncUseCase.execute();
    }

    public async disableAutoSync(): Promise<Result<void, ApplicationError>> {
        return await this.disableAutoSyncUseCase.execute();
    }
}
