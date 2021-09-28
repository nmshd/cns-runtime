import { Result } from "@js-soft/ts-utils";
import { CoreId, DevicesController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { DeviceOnboardingInfoDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { DeviceMapper } from "./DeviceMapper";

export interface GetDeviceOnboardingInfoRequest {
    id: string;
}

export class GetDeviceOnboardingInfoUseCase extends UseCase<GetDeviceOnboardingInfoRequest, DeviceOnboardingInfoDTO> {
    public constructor(@Inject private readonly devicesController: DevicesController, @Inject validator: RuntimeValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetDeviceOnboardingInfoRequest): Promise<Result<DeviceOnboardingInfoDTO>> {
        const onboardingInfo = await this.devicesController.getSharedSecret(CoreId.from(request.id));

        return Result.ok(DeviceMapper.toDeviceOnboardingInfoDTO(onboardingInfo));
    }
}
