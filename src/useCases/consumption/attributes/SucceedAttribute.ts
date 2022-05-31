import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, SucceedConsumptionAttributeParams } from "@nmshd/consumption";
import { IdentityAttributeJSON, RelationshipAttributeJSON } from "@nmshd/content";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface SucceedAttributeRequest {
    successorContent: IdentityAttributeJSON | RelationshipAttributeJSON;
    /**
     * @pattern ATT[A-Za-z0-9]{17}
     */
    succeeds: string;
}

class Validator extends SchemaValidator<SucceedAttributeRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("SucceedAttributeRequest"));
    }
}
export class SucceedAttributeUseCase extends UseCase<SucceedAttributeRequest, ConsumptionAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: ConsumptionAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: SucceedAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const params = SucceedConsumptionAttributeParams.from({
            successorContent: request.successorContent,
            succeeds: CoreId.from(request.succeeds)
        });
        const successor = await this.attributeController.succeedConsumptionAttribute(params);

        await this.accountController.syncDatawallet();

        return Result.ok(AttributeMapper.toAttributeDTO(successor));
    }
}
