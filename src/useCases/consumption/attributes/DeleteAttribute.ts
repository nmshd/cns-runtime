import { Result } from "@js-soft/ts-utils";
import { LocalAttribute, LocalAttributesController } from "@nmshd/consumption";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";

export interface DeleteAttributeRequest {
    /**
     * @pattern ATT[A-Za-z0-9]{17}
     */
    id: string;
}

class Validator extends SchemaValidator<DeleteAttributeRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("DeleteAttributeRequest"));
    }
}
export class DeleteAttributeUseCase extends UseCase<DeleteAttributeRequest, void> {
    public constructor(
        @Inject private readonly attributeController: LocalAttributesController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: DeleteAttributeRequest): Promise<Result<void>> {
        const attribute = await this.attributeController.getLocalAttribute(CoreId.from(request.id));
        if (!attribute) {
            return Result.fail(RuntimeErrors.general.recordNotFound(LocalAttribute));
        }

        await this.attributeController.deleteAttribute(attribute);
        await this.accountController.syncDatawallet();

        return Result.ok(undefined);
    }
}
