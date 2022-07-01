import { Result } from "@js-soft/ts-utils";
import { BackboneIds, CoreId, Token, TokenController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { IdValidator, QRCode, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";

export interface GetQRCodeForTokenRequest {
    id: string;
}

class GetQRCodeForTokenRequestValidator extends RuntimeValidator<GetQRCodeForTokenRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.id).fulfills(IdValidator.required(BackboneIds.token));
    }
}

export interface GetQRCodeForTokenResponse {
    qrCodeBytes: string;
}

export class GetQRCodeForTokenUseCase extends UseCase<GetQRCodeForTokenRequest, GetQRCodeForTokenResponse> {
    public constructor(@Inject private readonly tokenController: TokenController, @Inject validator: GetQRCodeForTokenRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetQRCodeForTokenRequest): Promise<Result<GetQRCodeForTokenResponse>> {
        const token = await this.tokenController.getToken(CoreId.from(request.id));

        if (!token) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Token));
        }

        const qrCode = await QRCode.forTruncateable(token);
        return Result.ok({ qrCodeBytes: qrCode.asBase64() });
    }
}
