import { Result } from "@js-soft/ts-utils";
import { LocalAttributesController, UpdateLocalAttributeParams } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { LocalAttributeDTO } from "../../../types";
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

export class UpdateAttributeUseCase extends UseCase<UpdateAttributeRequest, LocalAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: LocalAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: UpdateAttributeRequest): Promise<Result<LocalAttributeDTO>> {
        const params = UpdateLocalAttributeParams.from({
            id: request.id,
            content: request.content
        });
        const updated = await this.attributeController.updateLocalAttribute(params);

        await this.accountController.syncDatawallet();

        return Result.ok(AttributeMapper.toAttributeDTO(updated));
    }
}
