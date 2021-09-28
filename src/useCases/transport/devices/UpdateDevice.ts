import { Result } from "@js-soft/ts-utils";
import { AccountController, BackboneIds, CoreId, Device, DevicesController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { DeviceMapper } from ".";
import { DeviceDTO } from "../../..";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";

export interface UpdateDeviceRequest {
    id: string;
    name?: string;
    description?: string;
}

class UpdateDeviceRequestValidator extends RuntimeValidator<UpdateDeviceRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.id).fulfills(IdValidator.required(BackboneIds.device));
    }
}

export class UpdateDeviceUseCase extends UseCase<UpdateDeviceRequest, DeviceDTO> {
    public constructor(
        @Inject private readonly devicesController: DevicesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: UpdateDeviceRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: UpdateDeviceRequest): Promise<Result<DeviceDTO>> {
        const device = await this.devicesController.get(CoreId.from(request.id));

        if (!device) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Device));
        }

        if (request.name) {
            device.name = request.name;
        }
        device.description = request.description;

        await this.devicesController.update(device);
        await this.accountController.syncDatawallet();

        return Result.ok(DeviceMapper.toDeviceDTO(device));
    }
}
