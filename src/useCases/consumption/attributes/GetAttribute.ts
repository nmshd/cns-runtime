import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController } from "@nmshd/consumption";
import { Attribute } from "@nmshd/content";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface GetAttributeRequest {
    /**
     * @pattern ATT[A-Za-z0-9]{17}
     */
    id: string;
}

class Validator extends SchemaValidator<GetAttributeRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("GetAttributeRequest"));
    }
}
export class GetAttributeUseCase extends UseCase<GetAttributeRequest, ConsumptionAttributeDTO> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: Validator) {
        super(validator);
    }

    protected async executeInternal(request: GetAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const attribute = await this.attributeController.getConsumptionAttribute(CoreId.from(request.id));
        if (!attribute) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Attribute));
        }

        return Result.ok(AttributeMapper.toAttributeDTO(attribute));
    }
}
