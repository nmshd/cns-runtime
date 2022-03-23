import { ILogger } from "@js-soft/logging-abstractions";
import { EventBus, Result } from "@js-soft/ts-utils";
import { AccountController, IdentityController } from "@nmshd/transport";
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

export interface SyncEverythingRequest {
    callback?(percentage: number, syncStep: string): void;
}

export class SyncEverythingUseCase extends UseCase<SyncEverythingRequest, SyncEverythingResponse> {
    private readonly logger: ILogger;
    public constructor(
        @Inject private readonly accountController: AccountController,
        @Inject private readonly identityController: IdentityController,
        @Inject private readonly eventBus: EventBus,
        @Inject loggerFactory: RuntimeLoggerFactory
    ) {
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

        const eventTargetAddress = this.identityController.identity.address.toString();
        this.processNewMessages(messageDTOs, eventTargetAddress);
        this.processNewRelationships(relationshipDTOs, eventTargetAddress);

        return Result.ok({
            messages: messageDTOs,
            relationships: relationshipDTOs
        });
    }

    private processNewRelationships(relationships: RelationshipDTO[], eventTargetAddress: string) {
        if (relationships.length === 0) {
            return;
        }

        this.logger.debug(`Found ${relationships.length} relationship(s) with changes. Start publishing on event bus...`);

        for (const relationship of relationships) {
            this.eventBus.publish(new RelationshipChangedEvent(eventTargetAddress, relationship));
        }

        this.logger.debug("Finished publishing relationship changes on event bus.");
    }

    private processNewMessages(messages: MessageDTO[], eventTargetAddress: string) {
        if (messages.length === 0) {
            return;
        }

        this.logger.debug(`Found ${messages.length} new message(s). Start publishing on event bus...`);

        for (const message of messages) {
            this.eventBus.publish(new MessageReceivedEvent(eventTargetAddress, message));
        }

        this.logger.debug("Finished publishing message changes on event bus.");
    }
}
