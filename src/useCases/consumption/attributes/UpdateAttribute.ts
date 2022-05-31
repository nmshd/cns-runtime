import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController } from "@nmshd/consumption";
import { IdentityAttributeJSON, RelationshipAttributeJSON } from "@nmshd/content";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface UpdateAttributeRequest {
    /**
     * @pattern ATT[A-Za-z0-9]{17}
     */
    id: string;
    content: IdentityAttributeJSON | RelationshipAttributeJSON;
}

class Validator extends SchemaValidator<UpdateAttributeRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("UpdateAttributeRequest"));
    }
}

export class UpdateAttributeUseCase extends UseCase<UpdateAttributeRequest, ConsumptionAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: ConsumptionAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: UpdateAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const updated = await this.attributeController.updateConsumptionAttribute({ id: CoreId.from(request.id), content: request.content });
        await this.accountController.syncDatawallet();
        return Result.ok(AttributeMapper.toAttributeDTO(updated));
    }
}
