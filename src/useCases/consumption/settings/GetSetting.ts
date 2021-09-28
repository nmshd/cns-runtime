import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, Setting, SettingsController } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { SettingDTO } from "../../../types";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { SettingMapper } from "./SettingMapper";

export interface GetSettingRequest {
    id: string;
}

class GetSettingRequestValidator extends RuntimeValidator<GetSettingRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.setting));
    }
}

export class GetSettingUseCase extends UseCase<GetSettingRequest, SettingDTO> {
    public constructor(@Inject private readonly settingController: SettingsController, @Inject validator: GetSettingRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetSettingRequest): Promise<Result<SettingDTO>> {
        const setting = await this.settingController.getSetting(CoreId.from(request.id));
        if (!setting) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Setting));
        }

        return Result.ok(SettingMapper.toSettingDTO(setting));
    }
}
