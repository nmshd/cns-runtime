import { EventBus, Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, UpdateConsumptionAttributeParams } from "@nmshd/consumption";
import { AccountController, IdentityController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { AttributeUpdatedEvent } from "../../../events";
import { ConsumptionAttributeDTO } from "../../../types";
import { SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";
import { ExtendedIdentityAttributeJSON, ExtendedRelationshipAttributeJSON } from "./ExtendedAttributeValue";

export interface UpdateAttributeRequest {
    /**
     * @pattern ATT[A-Za-z0-9]{17}
     */
    id: string;
    content: ExtendedIdentityAttributeJSON | ExtendedRelationshipAttributeJSON;
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

        @Inject private readonly identityController: IdentityController,
        @Inject private readonly eventBus: EventBus,

        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: UpdateAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const params = UpdateConsumptionAttributeParams.from({
            id: request.id,
            content: request.content
        });
        const updated = await this.attributeController.updateConsumptionAttribute(params);
        await this.accountController.syncDatawallet();

        const attributeDTO = AttributeMapper.toAttributeDTO(updated);
        this.eventBus.publish(new AttributeUpdatedEvent(this.identityController.identity.address.toString(), attributeDTO));
        return Result.ok(attributeDTO);
    }
}
