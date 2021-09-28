import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreId, Device, DevicesController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { DeviceDTO } from "../../../types/core/DeviceDTO";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { DeviceMapper } from "./DeviceMapper";

export interface GetDeviceRequest {
    id: string;
}

class GetDeviceRequestValidator extends RuntimeValidator<GetDeviceRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.id).fulfills(IdValidator.required(BackboneIds.device));
    }
}

export class GetDeviceUseCase extends UseCase<GetDeviceRequest, DeviceDTO> {
    public constructor(@Inject private readonly devicesController: DevicesController, @Inject validator: GetDeviceRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetDeviceRequest): Promise<Result<DeviceDTO>> {
        const device = await this.devicesController.get(CoreId.from(request.id));

        if (!device) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Device));
        }

        return Result.ok(DeviceMapper.toDeviceDTO(device));
    }
}
