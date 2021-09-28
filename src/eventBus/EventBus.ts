import { Event } from "../events/Event";

export type EventHandler<TEvent> = (event: TEvent) => void;
export type SubscriptionTarget = string | Function;

export abstract class EventBus {
    abstract subscribe<TEvent = any>(namespace: string, handler: EventHandler<TEvent>): number;
    abstract subscribe<TEvent = any>(eventConstructor: Function, handler: EventHandler<TEvent>): number;
    abstract subscribe<TEvent = any>(subscriptionTarget: SubscriptionTarget, handler: EventHandler<TEvent>): number;

    abstract subscribeOnce<TEvent = any>(namespace: string, handler: EventHandler<TEvent>): number;
    abstract subscribeOnce<TEvent = any>(eventConstructor: Function, handler: EventHandler<TEvent>): number;
    abstract subscribeOnce<TEvent = any>(subscriptionTarget: SubscriptionTarget, handler: EventHandler<TEvent>): number;

    abstract unsubscribe(subscriptionTarget: SubscriptionTarget, subscriptionId: number): boolean;

    abstract publish(event: object): void;
}

export function getEventNamespaceFromObject(targetObject: Event): string {
    return targetObject.namespace;
}
