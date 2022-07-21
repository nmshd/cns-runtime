import { Result } from "@js-soft/ts-utils";
import { LocalAttributesController, SucceedLocalAttributeParams } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { LocalAttributeDTO } from "../../../types";
import { SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";
import { ExtendedIdentityAttributeJSON, ExtendedRelationshipAttributeJSON } from "./ExtendedAttributeValue";

export interface SucceedAttributeRequest {
    successorContent: ExtendedIdentityAttributeJSON | ExtendedRelationshipAttributeJSON;
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
export class SucceedAttributeUseCase extends UseCase<SucceedAttributeRequest, LocalAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: LocalAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: SucceedAttributeRequest): Promise<Result<LocalAttributeDTO>> {
        const params = SucceedLocalAttributeParams.from({
            successorContent: request.successorContent,
            succeeds: request.succeeds
        });
        const successor = await this.attributeController.succeedLocalAttribute(params);

        await this.accountController.syncDatawallet();

        return Result.ok(AttributeMapper.toAttributeDTO(successor));
    }
}
