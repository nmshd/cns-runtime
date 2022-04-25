import { Serializable } from "@js-soft/ts-serval";
import { Result } from "@js-soft/ts-utils";
import { AccountController, CoreDate, TokenController } from "@nmshd/transport";
import { DateTime } from "luxon";
import { Inject } from "typescript-ioc";
import { TokenDTO } from "../../../types";
import { DateValidator, RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { TokenMapper } from "./TokenMapper";

export interface CreateOwnTokenRequest {
    content: any;
    expiresAt: string;
    ephemeral: boolean;
}

class CreateOwnTokenRequestValidator extends RuntimeValidator<CreateOwnTokenRequest> {
    public constructor() {
        super();

        this.validateIfAny((x) => x.content).isNotNull();

        this.validateIf((x) => x.expiresAt).isNotNull();

        this.validateIf((x) => x.expiresAt).fulfills(DateValidator.required());
        this.validateIf((x) => x.expiresAt)
            .fulfills((e) => DateTime.fromISO(e) > DateTime.utc())
            .withFailureMessage("'$propertyName' must be in the future.");

        this.validateIfAny((x) => x.ephemeral).isNotNull();
    }
}

export class CreateOwnTokenUseCase extends UseCase<CreateOwnTokenRequest, TokenDTO> {
    public constructor(
        @Inject private readonly tokenController: TokenController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateOwnTokenRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateOwnTokenRequest): Promise<Result<TokenDTO>> {
        let tokenContent;
        try {
            tokenContent = Serializable.fromUnknown(request.content);
        } catch {
            throw RuntimeErrors.general.invalidTokenContent();
        }

        const response = await this.tokenController.sendToken({
            content: tokenContent,
            expiresAt: CoreDate.from(request.expiresAt),
            ephemeral: request.ephemeral
        });

        if (!request.ephemeral) {
            await this.accountController.syncDatawallet();
        }

        return Result.ok(TokenMapper.toTokenDTO(response, request.ephemeral));
    }
}
