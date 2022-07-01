import { EventBus, Result } from "@js-soft/ts-utils";
import { CreateSharedLocalAttributeCopyParams, LocalAttributesController } from "@nmshd/consumption";
import { AccountController, CoreAddress, CoreId, IdentityController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { SharedAttributeCopyCreatedEvent } from "../../../events";
import { LocalAttributeDTO } from "../../../types";
import { SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface CreateSharedAttributeCopyRequest {
    /**
     * @pattern ATT[A-Za-z0-9]{17}
     */
    attributeId: string;
    /**
     * @pattern [a-zA-Z1-9]{35,36}
     */
    peer: string;
    /**
     * @pattern REQ[A-Za-z0-9]{17}
     */
    requestReference: string;
}

class Validator extends SchemaValidator<CreateSharedAttributeCopyRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("CreateSharedAttributeCopyRequest"));
    }
}

export class CreateSharedAttributeCopyUseCase extends UseCase<CreateSharedAttributeCopyRequest, LocalAttributeDTO> {
    public constructor(
        @Inject private readonly attributeController: LocalAttributesController,
        @Inject private readonly accountController: AccountController,

        @Inject private readonly identityController: IdentityController,
        @Inject private readonly eventBus: EventBus,

        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateSharedAttributeCopyRequest): Promise<Result<LocalAttributeDTO>> {
        const params = CreateSharedLocalAttributeCopyParams.from({
            attributeId: CoreId.from(request.attributeId),
            peer: CoreAddress.from(request.peer),
            requestReference: CoreId.from(request.requestReference)
        });
        const successor = await this.attributeController.createSharedLocalAttributeCopy(params);
        await this.accountController.syncDatawallet();

        const attributeDTO = AttributeMapper.toAttributeDTO(successor);
        this.eventBus.publish(new SharedAttributeCopyCreatedEvent(this.identityController.identity.address.toString(), attributeDTO));
        return Result.ok(attributeDTO);
    }
}
