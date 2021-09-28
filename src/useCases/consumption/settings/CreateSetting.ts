import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, SettingsController, SettingScope } from "@nmshd/consumption";
import { AccountController, CoreDate, CoreId, TransportIds } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { SettingDTO } from "../../../types";
import { DateValidator, IdValidator, RuntimeValidator, UseCase } from "../../common";
import { SettingMapper } from "./SettingMapper";

export interface CreateSettingRequest {
    key: string;
    value: any;

    reference?: string;
    scope?: string;
    succeedsAt?: string;
    succeedsItem?: string;
}

class CreateSettingRequestValidator extends RuntimeValidator<CreateSettingRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.key).isDefined();
        this.validateIfAny((x) => x.value).isDefined();

        this.validateIfString((x) => x.reference).fulfills(IdValidator.optional(TransportIds.generic));
        this.validateIfString((x) => x.scope)
            .isIn([SettingScope.Device, SettingScope.Identity, SettingScope.Relationship])
            .whenDefined();
        this.validateIfString((x) => x.succeedsAt).fulfills(DateValidator.optional());
        this.validateIfString((x) => x.succeedsItem).fulfills(IdValidator.optional(ConsumptionIds.setting));
    }
}

export class CreateSettingUseCase extends UseCase<CreateSettingRequest, SettingDTO> {
    public constructor(
        @Inject private readonly settingController: SettingsController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateSettingRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateSettingRequest): Promise<Result<SettingDTO>> {
        const setting = await this.settingController.createSetting({
            key: request.key,
            value: request.value,
            reference: request.reference ? CoreId.from(request.reference) : undefined,
            scope: request.scope as SettingScope | undefined,
            succeedsAt: request.succeedsAt ? CoreDate.from(request.succeedsAt) : undefined,
            succeedsItem: request.succeedsItem ? CoreId.from(request.succeedsItem) : undefined
        });
        await this.accountController.syncDatawallet();

        return Result.ok(SettingMapper.toSettingDTO(setting));
    }
}
