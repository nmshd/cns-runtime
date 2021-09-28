import { Result } from "@js-soft/ts-utils";
import {
    AccountController,
    BackboneIds,
    CoreDate,
    CoreId,
    RelationshipTemplate,
    RelationshipTemplateController,
    TokenContentRelationshipTemplate,
    TokenController
} from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import { DateValidator, IdValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { TokenMapper } from "../tokens/TokenMapper";

export interface CreateTokenForOwnTemplateRequest {
    templateId: string;
    expiresAt?: string;
    ephemeral?: boolean;
}

class CreateTokenForOwnTemplateRequestValidator extends RuntimeValidator<CreateTokenForOwnTemplateRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.templateId).fulfills(IdValidator.required(BackboneIds.relationshipTemplate));
        this.validateIfString((x) => x.expiresAt).fulfills(DateValidator.optional());
    }
}

export class CreateTokenForOwnTemplateUseCase extends UseCase<CreateTokenForOwnTemplateRequest, TokenDTO> {
    public constructor(
        @Inject private readonly templateController: RelationshipTemplateController,
        @Inject private readonly tokenController: TokenController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateTokenForOwnTemplateRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateTokenForOwnTemplateRequest): Promise<Result<TokenDTO>> {
        const template = await this.templateController.getRelationshipTemplate(CoreId.from(request.templateId));

        if (!template) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipTemplate));
        }

        if (!template.isOwn) {
            return Result.fail(RuntimeErrors.relationshipTemplates.cannotCreateTokenForPeerTemplate());
        }

        const tokenContent = await TokenContentRelationshipTemplate.from({
            templateId: template.id,
            secretKey: template.secretKey
        });

        const ephemeral = request.ephemeral ?? true;
        const defaultTokenExpiry = template.cache?.expiresAt ?? CoreDate.utc().add({ days: 12 });
        const tokenExpiry = request.expiresAt ? CoreDate.from(request.expiresAt) : defaultTokenExpiry;
        const token = await this.tokenController.sendToken({
            content: tokenContent,
            expiresAt: tokenExpiry,
            ephemeral
        });

        if (!ephemeral) {
            await this.accountController.syncDatawallet();
        }

        return Result.ok(await TokenMapper.toTokenDTO(token, ephemeral));
    }
}
