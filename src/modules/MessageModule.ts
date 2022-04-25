import { Mail, RequestMail } from "@nmshd/content";
import { MessageReceivedEvent } from "../events";
import { MailReceivedEvent } from "../events/consumption/MailReceivedEvent";
import { RelationshipEvent } from "../events/consumption/RelationshipEvent";
import { RequestMailReceivedEvent } from "../events/consumption/RequestMailReceivedEvent";
import { RequestReceivedEvent } from "../events/consumption/RequestReceivedEvent";
import { Event } from "../events/Event";
import { ModuleConfiguration, RuntimeModule } from "../extensibility/modules/RuntimeModule";

export interface MessageModuleConfiguration extends ModuleConfiguration {}

export default class MessageModule extends RuntimeModule<MessageModuleConfiguration> {
    private messageReceivedSubscription: number;
    public init(): void {
        // Nothing to do here
    }

    public start(): void {
        this.messageReceivedSubscription = this.runtime.eventBus.subscribe(MessageReceivedEvent, this.handleMessageReceived);
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

                let i = 0;
                for (const request of requestMail.requests) {
                    this.runtime.eventBus.publish(new RequestReceivedEvent(messageReceivedEvent.eventTargetAddress, request, message));
                    this.logger.trace(`Published RequestReceivedEvent request #${i} of RequestMail ${message.id}`);
                    i++;
                }

                break;

            default:
                // Unknown type
                return;
        }

        const result = await this.runtime.transportServices.relationships.getRelationshipByAddress({ address: message.createdBy });
        if (!result.isSuccess) {
            this.logger.error(`Could not find relationship for address '${message.createdBy}'.`, result.error);
            return;
        }
        const relationship = result.value;

        this.runtime.eventBus.publish(new RelationshipEvent(messageReceivedEvent.eventTargetAddress, event, relationship));
        this.logger.trace(`Published RelationshipEvent for ${message.id} to ${relationship.id}`);
    }

    public stop(): void {
        this.runtime.eventBus.unsubscribe(MessageReceivedEvent, this.messageReceivedSubscription);
    }
}
