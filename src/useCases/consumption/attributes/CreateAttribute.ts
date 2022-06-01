import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, CreateConsumptionAttributeParams } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
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

export class CreateAttributeUseCase extends UseCase<CreateAttributeRequest, ConsumptionAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: ConsumptionAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const params = CreateConsumptionAttributeParams.from({
            content: request.content
        });
        const createdAttribute = await this.attributeController.createConsumptionAttribute(params);
        await this.accountController.syncDatawallet();

        return Result.ok(AttributeMapper.toAttributeDTO(createdAttribute));
    }
}
