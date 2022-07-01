import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreId, RelationshipTemplate, RelationshipTemplateController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IdValidator, QRCode, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";

export interface CreateQrCodeForOwnTemplateRequest {
    templateId: string;
}

class CreateQrCodeForOwnTemplateRequestValidator extends RuntimeValidator<CreateQrCodeForOwnTemplateRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.templateId).fulfills(IdValidator.required(BackboneIds.relationshipTemplate));
    }
}

export interface CreateQrCodeForOwnTemplateResponse {
    qrCodeBytes: string;
}

export class CreateQrCodeForOwnTemplateUseCase extends UseCase<CreateQrCodeForOwnTemplateRequest, CreateQrCodeForOwnTemplateResponse> {
    public constructor(@Inject private readonly templateController: RelationshipTemplateController, @Inject validator: CreateQrCodeForOwnTemplateRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: CreateQrCodeForOwnTemplateRequest): Promise<Result<CreateQrCodeForOwnTemplateResponse>> {
        const template = await this.templateController.getRelationshipTemplate(CoreId.from(request.templateId));

        if (!template) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipTemplate));
        }

        if (!template.isOwn) {
            return Result.fail(RuntimeErrors.relationshipTemplates.cannotCreateQRCodeForPeerTemplate());
        }

        const qrCode = await QRCode.from(template.truncate());
        return Result.ok({ qrCodeBytes: qrCode.asBase64() });
    }
}
