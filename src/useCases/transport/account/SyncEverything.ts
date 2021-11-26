import { ILogger } from "@js-soft/logging-abstractions";
import { EventBus, Result } from "@js-soft/ts-utils";
import { AccountController } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { MessageReceivedEvent, RelationshipChangedEvent } from "../../../events";
import { RuntimeLoggerFactory } from "../../../RuntimeLoggerFactory";
import { MessageDTO } from "../../../types/transport/MessageDTO";
import { RelationshipDTO } from "../../../types/transport/RelationshipDTO";
import { UseCase } from "../../common";
import { MessageMapper } from "../messages/MessageMapper";
import { RelationshipMapper } from "../relationships/RelationshipMapper";

export interface SyncEverythingResponse {
    relationships: RelationshipDTO[];
    messages: MessageDTO[];
}

export class SyncEverythingUseCase extends UseCase<void, SyncEverythingResponse> {
    private readonly logger: ILogger;
    public constructor(@Inject private readonly accountController: AccountController, @Inject private readonly eventBus: EventBus, @Inject loggerFactory: RuntimeLoggerFactory) {
        super();

        this.logger = loggerFactory.getLogger(SyncEverythingUseCase);
    }

    private currentSync?: Promise<Result<SyncEverythingResponse>>;

    protected async executeInternal(): Promise<Result<SyncEverythingResponse>> {
        if (this.currentSync) {
            return await this.currentSync;
        }

        this.currentSync = this._executeInternal();

        try {
            return await this.currentSync;
        } finally {
            this.currentSync = undefined;
        }
    }

    private async _executeInternal() {
        const changedItems = await this.accountController.syncEverything();

        const messageDTOs = changedItems.messages.map((m) => MessageMapper.toMessageDTO(m));
        const relationshipDTOs = changedItems.relationships.map((r) => RelationshipMapper.toRelationshipDTO(r));

        this.processNewMessages(messageDTOs);
        this.processNewRelationships(relationshipDTOs);

        return Result.ok({
            messages: messageDTOs,
            relationships: relationshipDTOs
        });
    }

    private processNewRelationships(relationships: RelationshipDTO[]) {
        if (relationships.length === 0) {
            return;
        }

        this.logger.debug(`Found ${relationships.length} relationship(s) with changes. Start publishing on event bus...`);

        for (const relationship of relationships) {
            this.eventBus.publish(new RelationshipChangedEvent(relationship));
        }

        this.logger.debug("Finished publishing relationship changes on event bus.");
    }

    private processNewMessages(messages: MessageDTO[]) {
        if (messages.length === 0) {
            return;
        }

        this.logger.debug(`Found ${messages.length} new message(s). Start publishing on event bus...`);

        for (const message of messages) {
            this.eventBus.publish(new MessageReceivedEvent(message));
        }

        this.logger.debug("Finished publishing message changes on event bus.");
    }
}
