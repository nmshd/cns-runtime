import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreDate, CoreId, RelationshipTemplate, RelationshipTemplateController, TokenContentRelationshipTemplate, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { DateValidator, IdValidator, QRCode, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";

export interface CreateTokenQrCodeForOwnTemplateRequest {
    templateId: string;
    expiresAt?: string;
}

class CreateTokenQrCodeForOwnTemplateRequestValidator extends RuntimeValidator<CreateTokenQrCodeForOwnTemplateRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.templateId).fulfills(IdValidator.required(BackboneIds.relationshipTemplate));
        this.validateIfString((x) => x.expiresAt).fulfills(DateValidator.optional());
    }
}

export interface CreateTokenQrCodeForOwnTemplateResponse {
    qrCodeBytes: string;
}

export class CreateTokenQrCodeForOwnTemplateUseCase extends UseCase<CreateTokenQrCodeForOwnTemplateRequest, CreateTokenQrCodeForOwnTemplateResponse> {
    public constructor(
        @Inject private readonly templateController: RelationshipTemplateController,
        @Inject private readonly tokenController: TokenController,
        @Inject validator: CreateTokenQrCodeForOwnTemplateRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateTokenQrCodeForOwnTemplateRequest): Promise<Result<CreateTokenQrCodeForOwnTemplateResponse>> {
        const template = await this.templateController.getRelationshipTemplate(CoreId.from(request.templateId));

        if (!template) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipTemplate));
        }

        if (!template.isOwn) {
            return Result.fail(RuntimeErrors.relationshipTemplates.cannotCreateTokenForPeerTemplate());
        }

        const tokenContent = TokenContentRelationshipTemplate.from({
            templateId: template.id,
            secretKey: template.secretKey
        });

        const defaultTokenExpiry = template.cache?.expiresAt ?? CoreDate.utc().add({ days: 12 });
        const tokenExpiry = request.expiresAt ? CoreDate.from(request.expiresAt) : defaultTokenExpiry;
        const token = await this.tokenController.sendToken({
            content: tokenContent,
            expiresAt: tokenExpiry,
            ephemeral: true
        });

        const qrCode = await QRCode.forTruncateable(token);
        return Result.ok({ qrCodeBytes: qrCode.asBase64() });
    }
}
