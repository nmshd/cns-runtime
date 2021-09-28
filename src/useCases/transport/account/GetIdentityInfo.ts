import { Result } from "@js-soft/ts-utils";
import { IdentityController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { UseCase } from "../../common";

export interface GetIdentityInfoResponse {
    address: string;
    publicKey: string;
}

export class GetIdentityInfoUseCase extends UseCase<void, GetIdentityInfoResponse> {
    public constructor(@Inject private readonly identityController: IdentityController) {
        super();
    }

    protected executeInternal(): Result<GetIdentityInfoResponse> {
        const identity = this.identityController.identity;

        return Result.ok({
            address: identity.address.toString(),
            publicKey: identity.publicKey.toString()
        });
    }
}
