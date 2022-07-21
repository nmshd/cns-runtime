import { ILogger } from "@js-soft/logging-abstractions";
import { Result } from "@js-soft/ts-utils";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RuntimeLoggerFactory } from "../../../RuntimeLoggerFactory";
import { MessageDTO, RelationshipDTO } from "../../../types";
import { UseCase } from "../../common";
import { MessageMapper } from "../messages/MessageMapper";
import { RelationshipMapper } from "../relationships/RelationshipMapper";

export interface SyncEverythingResponse {
    relationships: RelationshipDTO[];
    messages: MessageDTO[];
}

export interface SyncEverythingRequest {
    callback?(percentage: number, syncStep: string): void;
}

export class SyncEverythingUseCase extends UseCase<SyncEverythingRequest, SyncEverythingResponse> {
    private readonly logger: ILogger;
    public constructor(@Inject private readonly accountController: AccountController, @Inject loggerFactory: RuntimeLoggerFactory) {
        super();

        this.logger = loggerFactory.getLogger(SyncEverythingUseCase);
    }

    private currentSync?: Promise<Result<SyncEverythingResponse>>;

    protected async executeInternal(request: SyncEverythingRequest): Promise<Result<SyncEverythingResponse>> {
        if (this.currentSync) {
            return await this.currentSync;
        }

        this.currentSync = this._executeInternal(request);

        try {
            return await this.currentSync;
        } finally {
            this.currentSync = undefined;
        }
    }

    private async _executeInternal(request: SyncEverythingRequest) {
        const changedItems = await this.accountController.syncEverything(request.callback);

        const messageDTOs = changedItems.messages.map((m) => MessageMapper.toMessageDTO(m));
        const relationshipDTOs = changedItems.relationships.map((r) => RelationshipMapper.toRelationshipDTO(r));

        return Result.ok({
            messages: messageDTOs,
            relationships: relationshipDTOs
        });
    }
}
