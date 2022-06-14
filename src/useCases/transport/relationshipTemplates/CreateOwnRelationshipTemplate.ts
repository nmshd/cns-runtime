import { Result } from "@js-soft/ts-utils";
import { AccountController, CoreDate, RelationshipTemplateController } from "@nmshd/transport";
import { DateTime } from "luxon";
import { Inject } from "typescript-ioc";
import { RelationshipTemplateDTO } from "../../../types";
import { DateValidator, RuntimeValidator, UseCase } from "../../common";
import { RelationshipTemplateMapper } from "./RelationshipTemplateMapper";

export interface CreateOwnRelationshipTemplateRequest {
    expiresAt: string;
    content: any;
    maxNumberOfAllocations?: number;

    /**
     * @deprecated use `maxNumberOfAllocations` instead
     * @see maxNumberOfAllocations
     */
    maxNumberOfRelationships?: number;
}

class CreateOwnRelationshipTemplateRequestValidator extends RuntimeValidator<CreateOwnRelationshipTemplateRequest> {
    public constructor() {
        super();

        this.validateIf((x) => x.expiresAt).fulfills(DateValidator.required());
        this.validateIf((x) => x.expiresAt)
            .fulfills((e) => DateTime.fromISO(e) > DateTime.utc())
            .withFailureMessage("'$propertyName' must be in the future.");

        this.validateIfAny((x) => x.content).isNotNull();
        this.validateIfNumber((x) => x.maxNumberOfRelationships)
            .isGreaterThanOrEqual(1)
            .whenNotNull();

        this.validateIfNumber((x) => x.maxNumberOfAllocations)
            .isGreaterThanOrEqual(1)
            .whenNotNull();
    }
}

export class CreateOwnRelationshipTemplateUseCase extends UseCase<CreateOwnRelationshipTemplateRequest, RelationshipTemplateDTO> {
    public constructor(
        @Inject private readonly templateController: RelationshipTemplateController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateOwnRelationshipTemplateRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateOwnRelationshipTemplateRequest): Promise<Result<RelationshipTemplateDTO>> {
        const relationshipTemplate = await this.templateController.sendRelationshipTemplate({
            content: request.content,
            expiresAt: CoreDate.from(request.expiresAt),
            maxNumberOfAllocations: request.maxNumberOfAllocations,
            maxNumberOfRelationships: request.maxNumberOfRelationships
        });

        await this.accountController.syncDatawallet();

        return Result.ok(RelationshipTemplateMapper.toRelationshipTemplateDTO(relationshipTemplate));
    }
}
