import { EventBus, EventHandler, SubscriptionTarget } from "@js-soft/ts-utils";
import * as consumption from "@nmshd/consumption";
import * as transport from "@nmshd/transport";
import { AttributeMapper, MessageMapper, RelationshipMapper, RelationshipTemplateMapper } from "../useCases";
import { RequestMapper } from "../useCases/consumption/requests/RequestMapper";
import {
    AttributeCreatedEvent,
    AttributeDeletedEvent,
    AttributeSucceededEvent,
    AttributeUpdatedEvent,
    IncomingRequestReceivedEvent,
    IncomingRequestStatusChangedEvent,
    OutgoingRequestCreatedEvent,
    OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent,
    OutgoingRequestStatusChangedEvent,
    SharedAttributeCopyCreatedEvent
} from "./consumption";
import { MessageDeliveredEvent, MessageReceivedEvent, MessageSentEvent, PeerRelationshipTemplateLoadedEvent, RelationshipChangedEvent } from "./transport";

export class EventProxy {
    private readonly subscriptionIds: number[] = [];

    public constructor(private readonly targetEventBus: EventBus, private readonly sourceEventBus: EventBus) {}

    public start(): this {
        if (this.subscriptionIds.length > 0) throw new Error("EventProxy is already started");

        this.proxyConsumptionEvents();
        this.proxyTransportEvents();
        return this;
    }

    private proxyTransportEvents() {
        this.subscribeToSourceEvent(transport.MessageDeliveredEvent, (event) => {
            this.targetEventBus.publish(new MessageDeliveredEvent(event.eventTargetAddress, MessageMapper.toMessageDTO(event.data)));
        });

        this.subscribeToSourceEvent(transport.MessageReceivedEvent, (event) => {
            this.targetEventBus.publish(new MessageReceivedEvent(event.eventTargetAddress, MessageMapper.toMessageDTO(event.data)));
        });

        this.subscribeToSourceEvent(transport.MessageSentEvent, (event) => {
            this.targetEventBus.publish(new MessageSentEvent(event.eventTargetAddress, MessageMapper.toMessageDTO(event.data)));
        });

        this.subscribeToSourceEvent(transport.PeerRelationshipTemplateLoadedEvent, (event) => {
            this.targetEventBus.publish(new PeerRelationshipTemplateLoadedEvent(event.eventTargetAddress, RelationshipTemplateMapper.toRelationshipTemplateDTO(event.data)));
        });

        this.subscribeToSourceEvent(transport.RelationshipChangedEvent, (event) => {
            this.targetEventBus.publish(new RelationshipChangedEvent(event.eventTargetAddress, RelationshipMapper.toRelationshipDTO(event.data)));
        });
    }

    private proxyConsumptionEvents() {
        this.subscribeToSourceEvent(consumption.AttributeCreatedEvent, (event) => {
            this.targetEventBus.publish(new AttributeCreatedEvent(event.eventTargetAddress, AttributeMapper.toAttributeDTO(event.data)));
        });

        this.subscribeToSourceEvent(consumption.AttributeDeletedEvent, (event) => {
            this.targetEventBus.publish(new AttributeDeletedEvent(event.eventTargetAddress, AttributeMapper.toAttributeDTO(event.data)));
        });

        this.subscribeToSourceEvent(consumption.AttributeSucceededEvent, (event) => {
            this.targetEventBus.publish(new AttributeSucceededEvent(event.eventTargetAddress, AttributeMapper.toAttributeDTO(event.data)));
        });

        this.subscribeToSourceEvent(consumption.AttributeUpdatedEvent, (event) => {
            this.targetEventBus.publish(new AttributeUpdatedEvent(event.eventTargetAddress, AttributeMapper.toAttributeDTO(event.data)));
        });

        this.subscribeToSourceEvent(consumption.IncomingRequestReceivedEvent, (event) => {
            this.targetEventBus.publish(new IncomingRequestReceivedEvent(event.eventTargetAddress, RequestMapper.toLocalRequestDTO(event.data)));
        });

        this.subscribeToSourceEvent(consumption.IncomingRequestStatusChangedEvent, (event) => {
            this.targetEventBus.publish(
                new IncomingRequestStatusChangedEvent(event.eventTargetAddress, {
                    request: RequestMapper.toLocalRequestDTO(event.data.request),
                    oldStatus: event.data.oldStatus,
                    newStatus: event.data.newStatus
                })
            );
        });

        this.subscribeToSourceEvent(consumption.OutgoingRequestCreatedEvent, (event) => {
            this.targetEventBus.publish(new OutgoingRequestCreatedEvent(event.eventTargetAddress, RequestMapper.toLocalRequestDTO(event.data)));
        });

        this.subscribeToSourceEvent(consumption.OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent, (event) => {
            this.targetEventBus.publish(
                new OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent(event.eventTargetAddress, RequestMapper.toLocalRequestDTO(event.data))
            );
        });

        this.subscribeToSourceEvent(consumption.OutgoingRequestStatusChangedEvent, (event) => {
            this.targetEventBus.publish(
                new OutgoingRequestStatusChangedEvent(event.eventTargetAddress, {
                    request: RequestMapper.toLocalRequestDTO(event.data.request),
                    oldStatus: event.data.oldStatus,
                    newStatus: event.data.newStatus
                })
            );
        });

        this.subscribeToSourceEvent(consumption.SharedAttributeCopyCreatedEvent, (event) => {
            this.targetEventBus.publish(new SharedAttributeCopyCreatedEvent(event.eventTargetAddress, AttributeMapper.toAttributeDTO(event.data)));
        });
    }

    private subscribeToSourceEvent<TEvent = any>(subscriptionTarget: SubscriptionTarget<TEvent>, handler: EventHandler<TEvent>) {
        const subscriptionId = this.sourceEventBus.subscribe(subscriptionTarget, handler);
        this.subscriptionIds.push(subscriptionId);
    }

    public stop(): void {
        this.subscriptionIds.forEach((id) => this.sourceEventBus.unsubscribe(id));
    }
}
