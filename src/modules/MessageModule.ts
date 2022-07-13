import { Event } from "@js-soft/ts-utils";
import { Mail } from "@nmshd/content";
import { MailReceivedEvent, MessageReceivedEvent, RelationshipEvent } from "../events";
import { ModuleConfiguration, RuntimeModule } from "../extensibility/modules/RuntimeModule";

export interface MessageModuleConfiguration extends ModuleConfiguration {}

export class MessageModule extends RuntimeModule<MessageModuleConfiguration> {
    public init(): void {
        // Nothing to do here
    }

    public start(): void {
        this.subscribeToEvent(MessageReceivedEvent, this.handleMessageReceived.bind(this));
    }

    private async handleMessageReceived(messageReceivedEvent: MessageReceivedEvent) {
        const message = messageReceivedEvent.data;
        this.logger.trace(`Incoming MessageReceivedEvent for ${message.id}`);
        const content = message.content;
        const type = content["@type"];

        let event: Event | undefined;
        switch (type) {
            case "Mail":
                const mail = Mail.from(message.content);
                event = new MailReceivedEvent(messageReceivedEvent.eventTargetAddress, mail, message);
                this.runtime.eventBus.publish(event);
                this.logger.trace(`Published MailReceivedEvent for ${message.id}`);
                break;

            case "RequestMail":
                const requestMail = RequestMail.from(message.content);
                event = new RequestMailReceivedEvent(messageReceivedEvent.eventTargetAddress, requestMail, message);
                this.runtime.eventBus.publish(event);
                this.logger.trace(`Published RequestMailReceivedEvent for ${message.id}`);

                break;

            default:
                // Unknown type
                return;
        }

        const services = this.runtime.getServices(messageReceivedEvent.eventTargetAddress);
        const result = await services.transportServices.relationships.getRelationshipByAddress({ address: message.createdBy });
        if (!result.isSuccess) {
            this.logger.error(`Could not find relationship for address '${message.createdBy}'.`, result.error);
            return;
        }
        const relationship = result.value;

        this.runtime.eventBus.publish(new RelationshipEvent(messageReceivedEvent.eventTargetAddress, event, relationship));
        this.logger.trace(`Published RelationshipEvent for ${message.id} to ${relationship.id}`);
    }

    public stop(): void {
        this.unsubscribeFromAllEvents();
    }
}
