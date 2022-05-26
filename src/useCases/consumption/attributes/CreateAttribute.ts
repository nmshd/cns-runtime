import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttribute, ConsumptionAttributesController, ICreateConsumptionAttributeParams } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface CreateAttributeRequest {
    params: ICreateConsumptionAttributeParams;
}

class CreateAttributeRequestValidator extends RuntimeValidator<CreateAttributeRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.params.content).isDefined();
        this.validateIf((x) => x.params.content.value).isDefined();
    }
}

export class CreateAttributeUseCase extends UseCase<CreateAttributeRequest, ConsumptionAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: ConsumptionAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateAttributeRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateAttributeRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const attribute = await ConsumptionAttribute.fromAttribute(request.params.content);

        const createdAttribute = await this.attributeController.createConsumptionAttribute(attribute);
        await this.accountController.syncDatawallet();

        return Result.ok(AttributeMapper.toAttributeDTO(createdAttribute));
    }
}
