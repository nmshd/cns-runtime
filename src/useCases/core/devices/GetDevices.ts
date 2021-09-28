import { Result } from "@js-soft/ts-utils";
import { DevicesController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { DeviceDTO } from "../../../types/core/DeviceDTO";
import { UseCase } from "../../common";
import { DeviceMapper } from "./DeviceMapper";

export class GetDevicesUseCase extends UseCase<void, DeviceDTO[]> {
    public constructor(@Inject private readonly devicesController: DevicesController) {
        super();
    }

    protected async executeInternal(): Promise<Result<DeviceDTO[]>> {
        const devices = await this.devicesController.list();
        const deviceDTOs = devices.map((device) => DeviceMapper.toDeviceDTO(device));

        return Result.ok(deviceDTOs);
    }
}
