import { EventBus, Result } from "@js-soft/ts-utils";
import { CreateLocalAttributeParams, LocalAttributesController } from "@nmshd/consumption";
import { AccountController, IdentityController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { AttributeCreatedEvent } from "../../../events";
import { LocalAttributeDTO } from "../../../types";
import { SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";
import { ExtendedIdentityAttributeJSON, ExtendedRelationshipAttributeJSON } from "./ExtendedAttributeValue";

export interface CreateAttributeRequest {
    content: ExtendedIdentityAttributeJSON | ExtendedRelationshipAttributeJSON;
}

class Validator extends SchemaValidator<CreateAttributeRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("CreateAttributeRequest"));
    }
}

export class CreateAttributeUseCase extends UseCase<CreateAttributeRequest, LocalAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: LocalAttributesController,
        @Inject private readonly accountController: AccountController,

        @Inject private readonly identityController: IdentityController,
        @Inject private readonly eventBus: EventBus,

        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateAttributeRequest): Promise<Result<LocalAttributeDTO>> {
        const params = CreateLocalAttributeParams.from({
            content: request.content
        });
        const createdAttribute = await this.attributeController.createLocalAttribute(params);
        await this.accountController.syncDatawallet();

        const attributeDTO = AttributeMapper.toAttributeDTO(createdAttribute);
        this.eventBus.publish(new AttributeCreatedEvent(this.identityController.identity.address.toString(), attributeDTO));
        return Result.ok(attributeDTO);
    }
}
