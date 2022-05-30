import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, ConsumptionIds, ICreateSharedConsumptionAttributeCopyParams } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { IdValidator, RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface CreateShareAttributeCopyRequest {
    params: ICreateSharedConsumptionAttributeCopyParams;
}

class CreateSharedAttributeRequestValidator extends RuntimeValidator<CreateShareAttributeCopyRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.params.peer).isDefined();
        this.validateIf((x) => x.params.attributeId.toString()).fulfills(IdValidator.required(ConsumptionIds.attribute));
    }
}

export class CreateSharedAttributeCopyUseCase extends UseCase<CreateShareAttributeCopyRequest, ConsumptionAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: ConsumptionAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateSharedAttributeRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateShareAttributeCopyRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const successor = await this.attributeController.createSharedConsumptionAttributeCopy(request.params);

        await this.accountController.syncDatawallet();

        return Result.ok(AttributeMapper.toAttributeDTO(successor));
    }
}
