import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, Setting, SettingsController } from "@nmshd/consumption";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RuntimeErrors } from "../..";
import { IdValidator, RuntimeValidator, UseCase } from "../../common";

export interface DeleteSettingRequest {
    id: string;
}

class DeleteSettingRequestValidator extends RuntimeValidator<DeleteSettingRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.setting));
    }
}

export class DeleteSettingUseCase extends UseCase<DeleteSettingRequest, void> {
    public constructor(
        @Inject private readonly settingController: SettingsController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: DeleteSettingRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: DeleteSettingRequest): Promise<Result<void>> {
        const setting = await this.settingController.getSetting(CoreId.from(request.id));
        if (!setting) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Setting));
        }

        await this.settingController.deleteSetting(setting);
        await this.accountController.syncDatawallet();

        return Result.ok(undefined);
    }
}
