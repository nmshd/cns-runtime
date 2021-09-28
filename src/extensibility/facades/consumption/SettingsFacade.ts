import { ApplicationError, Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { SettingDTO } from "../../../types";
import {
    CreateSettingRequest,
    CreateSettingUseCase,
    DeleteSettingRequest,
    DeleteSettingUseCase,
    GetSettingRequest,
    GetSettingsRequest,
    GetSettingsUseCase,
    GetSettingUseCase,
    UpdateSettingRequest,
    UpdateSettingUseCase
} from "../../../useCases";

export class SettingsFacade {
    public constructor(
        @Inject private readonly createSettingUseCase: CreateSettingUseCase,
        @Inject private readonly updateSettingUseCase: UpdateSettingUseCase,
        @Inject private readonly deleteSettingUseCase: DeleteSettingUseCase,
        @Inject private readonly getSettingsUseCase: GetSettingsUseCase,
        @Inject private readonly getSettingUseCase: GetSettingUseCase
    ) {}

    public async createSetting(request: CreateSettingRequest): Promise<Result<SettingDTO, ApplicationError>> {
        return await this.createSettingUseCase.execute(request);
    }

    public async getSetting(request: GetSettingRequest): Promise<Result<SettingDTO, ApplicationError>> {
        return await this.getSettingUseCase.execute(request);
    }

    public async getSettings(request: GetSettingsRequest): Promise<Result<SettingDTO[], ApplicationError>> {
        return await this.getSettingsUseCase.execute(request);
    }

    public async deleteSetting(request: DeleteSettingRequest): Promise<Result<void, ApplicationError>> {
        return await this.deleteSettingUseCase.execute(request);
    }

    public async updateSetting(request: UpdateSettingRequest): Promise<Result<SettingDTO, ApplicationError>> {
        return await this.updateSettingUseCase.execute(request);
    }
}
