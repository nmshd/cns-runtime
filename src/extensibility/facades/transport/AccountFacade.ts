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
    RuntimeErrors,
    SyncDatawalletUseCase,
    SyncEverythingResponse,
    SyncEverythingUseCase,
    SyncInfo
} from "../../../useCases";

export class AccountFacade {
    public constructor(
        @Inject private readonly getIdentityInfoUseCase: GetIdentityInfoUseCase,
        @Inject private readonly getDeviceInfoUseCase: GetDeviceInfoUseCase,
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

    public async syncDatawallet(): Promise<Result<void, ApplicationError>> {
        return await this.syncDatawalletUseCase.execute();
    }

    public async syncEverything(): Promise<Result<SyncEverythingResponse, ApplicationError>> {
        return await this.syncEverythingUseCase.execute();
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
