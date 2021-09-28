import { SerializableAsync } from "@js-soft/ts-serval";
import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, Setting, SettingsController } from "@nmshd/consumption";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RuntimeErrors } from "../..";
import { SettingDTO } from "../../../types";
import { IdValidator, RuntimeValidator, UseCase } from "../../common";
import { SettingMapper } from "./SettingMapper";

export interface UpdateSettingRequest {
    id: string;
    value: any;
}

class UpdateSettingRequestValidator extends RuntimeValidator<UpdateSettingRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.setting));
        this.validateIfAny((x) => x.value).isDefined();
    }
}

export class UpdateSettingUseCase extends UseCase<UpdateSettingRequest, SettingDTO> {
    public constructor(
        @Inject private readonly settingController: SettingsController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: UpdateSettingRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: UpdateSettingRequest): Promise<Result<SettingDTO>> {
        const setting = await this.settingController.getSetting(CoreId.from(request.id));
        if (!setting) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Setting));
        }

        setting.value = await SerializableAsync.from(request.value);
        await this.settingController.updateSetting(setting);
        await this.accountController.syncDatawallet();

        return Result.ok(SettingMapper.toSettingDTO(setting));
    }
}
