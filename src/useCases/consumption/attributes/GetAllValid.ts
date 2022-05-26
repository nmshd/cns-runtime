import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController } from "@nmshd/consumption";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export class GetAllValidUseCase extends UseCase<void, ConsumptionAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController) {
        super();
    }

    protected async executeInternal(): Promise<Result<ConsumptionAttributeDTO[]>> {
        const attributes = await this.attributeController.getValidConsumptionAttributes();
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
