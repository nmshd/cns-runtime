import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController, CreateSharedConsumptionAttributeCopyParams } from "@nmshd/consumption";
import { AccountController, CoreAddress, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface CreateShareAttributeCopyRequest {
    /**
     * @pattern ATT[A-Za-z0-9]{17}
     */
    attributeId: string;
    /**
     * @pattern [a-zA-Z1-9]{35}|[a-zA-Z1-9]{36}
     */
    peer: string;
    /**
     * @pattern REQ[A-Za-z0-9]{17}
     */
    requestReference: string;
}

class Validator extends SchemaValidator<CreateShareAttributeCopyRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("CreateShareAttributeCopyRequest"));
    }
}

export class CreateSharedAttributeCopyUseCase extends UseCase<CreateShareAttributeCopyRequest, ConsumptionAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: ConsumptionAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateShareAttributeCopyRequest): Promise<Result<ConsumptionAttributeDTO>> {
        const params = CreateSharedConsumptionAttributeCopyParams.from({
            attributeId: CoreId.from(request.attributeId),
            peer: CoreAddress.from(request.peer),
            requestReference: CoreId.from(request.requestReference)
        });
        const successor = await this.attributeController.createSharedConsumptionAttributeCopy(params);
        await this.accountController.syncDatawallet();
        return Result.ok(AttributeMapper.toAttributeDTO(successor));
    }
}
