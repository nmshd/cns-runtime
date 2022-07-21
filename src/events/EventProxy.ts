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

    public constructor(private readonly externalEventBus: EventBus, private readonly internalEventBus: EventBus) {}

    public init(): void {
        this.proxyConsumptionEvents();
        this.proxyTransportEvents();
    }

    private proxyTransportEvents() {
        this.subscribeToInternalEvent(transport.MessageDeliveredEvent, (event) =>
            this.externalEventBus.publish(new MessageDeliveredEvent(event.eventTargetAddress, MessageMapper.toMessageDTO(event.data)))
        );

        this.subscribeToInternalEvent(transport.MessageReceivedEvent, (event) =>
            this.externalEventBus.publish(new MessageReceivedEvent(event.eventTargetAddress, MessageMapper.toMessageDTO(event.data)))
        );

        this.subscribeToInternalEvent(transport.MessageSentEvent, (event) =>
            this.externalEventBus.publish(new MessageSentEvent(event.eventTargetAddress, MessageMapper.toMessageDTO(event.data)))
        );

        this.subscribeToInternalEvent(transport.PeerRelationshipTemplateLoadedEvent, (event) =>
            this.externalEventBus.publish(new PeerRelationshipTemplateLoadedEvent(event.eventTargetAddress, RelationshipTemplateMapper.toRelationshipTemplateDTO(event.data)))
        );

        this.subscribeToInternalEvent(transport.RelationshipChangedEvent, (event) =>
            this.externalEventBus.publish(new RelationshipChangedEvent(event.eventTargetAddress, RelationshipMapper.toRelationshipDTO(event.data)))
        );
    }

    private proxyConsumptionEvents() {
        this.subscribeToInternalEvent(consumption.AttributeCreatedEvent, (event) => {
            this.externalEventBus.publish(new AttributeCreatedEvent(event.eventTargetAddress, AttributeMapper.toAttributeDTO(event.data)));
        });

        this.subscribeToInternalEvent(consumption.AttributeDeletedEvent, (event) => {
            this.externalEventBus.publish(new AttributeDeletedEvent(event.eventTargetAddress, AttributeMapper.toAttributeDTO(event.data)));
        });

        this.subscribeToInternalEvent(consumption.AttributeSucceededEvent, (event) => {
            this.externalEventBus.publish(new AttributeSucceededEvent(event.eventTargetAddress, AttributeMapper.toAttributeDTO(event.data)));
        });

        this.subscribeToInternalEvent(consumption.AttributeUpdatedEvent, (event) => {
            this.externalEventBus.publish(new AttributeUpdatedEvent(event.eventTargetAddress, AttributeMapper.toAttributeDTO(event.data)));
        });

        this.subscribeToInternalEvent(consumption.IncomingRequestReceivedEvent, (event) => {
            this.externalEventBus.publish(new IncomingRequestReceivedEvent(event.eventTargetAddress, RequestMapper.toLocalRequestDTO(event.data)));
        });

        this.subscribeToInternalEvent(consumption.IncomingRequestStatusChangedEvent, (event) => {
            this.externalEventBus.publish(
                new IncomingRequestStatusChangedEvent(event.eventTargetAddress, {
                    request: RequestMapper.toLocalRequestDTO(event.data.request),
                    oldStatus: event.data.oldStatus,
                    newStatus: event.data.newStatus
                })
            );
        });

        this.subscribeToInternalEvent(consumption.OutgoingRequestCreatedEvent, (event) => {
            this.externalEventBus.publish(new OutgoingRequestCreatedEvent(event.eventTargetAddress, RequestMapper.toLocalRequestDTO(event.data)));
        });

        this.subscribeToInternalEvent(consumption.OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent, (event) => {
            this.externalEventBus.publish(
                new OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent(event.eventTargetAddress, RequestMapper.toLocalRequestDTO(event.data))
            );
        });

        this.subscribeToInternalEvent(consumption.OutgoingRequestStatusChangedEvent, (event) => {
            this.externalEventBus.publish(
                new OutgoingRequestStatusChangedEvent(event.eventTargetAddress, {
                    request: RequestMapper.toLocalRequestDTO(event.data.request),
                    oldStatus: event.data.oldStatus,
                    newStatus: event.data.newStatus
                })
            );
        });

        this.subscribeToInternalEvent(consumption.SharedAttributeCopyCreatedEvent, (event) => {
            this.externalEventBus.publish(new SharedAttributeCopyCreatedEvent(event.eventTargetAddress, AttributeMapper.toAttributeDTO(event.data)));
        });
    }

    private subscribeToInternalEvent<TEvent = any>(subscriptionTarget: SubscriptionTarget<TEvent>, handler: EventHandler<TEvent>) {
        const subscriptionId = this.internalEventBus.subscribe(subscriptionTarget, handler);
        this.subscriptionIds.push(subscriptionId);
    }

    public close(): void {
        this.subscriptionIds.forEach((id) => this.internalEventBus.unsubscribe(id));
    }
}
