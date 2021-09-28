import { Result } from "@js-soft/ts-utils";
import { AccountController, BackboneIds, CoreId, Device, DevicesController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";

export interface DeleteDeviceRequest {
    id: string;
}

class DeleteDeviceRequestValidator extends RuntimeValidator<DeleteDeviceRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.id).fulfills(IdValidator.required(BackboneIds.device));
    }
}

export class DeleteDeviceUseCase extends UseCase<DeleteDeviceRequest, void> {
    public constructor(
        @Inject private readonly devicesController: DevicesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: DeleteDeviceRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: DeleteDeviceRequest): Promise<Result<void>> {
        const device = await this.devicesController.get(CoreId.from(request.id));

        if (!device) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Device));
        }

        await this.devicesController.delete(device);
        await this.accountController.syncDatawallet();

        return Result.ok(undefined);
    }
}
