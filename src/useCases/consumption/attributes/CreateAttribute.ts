import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttribute, ConsumptionAttributesController } from "@nmshd/consumption";
import { IAttribute } from "@nmshd/content";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface CreateAttributeRequest {
    attribute: IAttribute;
}

class CreateAttributeRequestValidator extends RuntimeValidator<CreateAttributeRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.attribute).isDefined();
        this.validateIfString((x) => x.attribute.name).isNotEmpty();
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
        const attribute = await ConsumptionAttribute.fromAttribute(request.attribute);

        const createdAttribute = await this.attributeController.createAttribute(attribute);
        await this.accountController.syncDatawallet();

        return Result.ok(AttributeMapper.toAttributeDTO(createdAttribute));
    }
}
