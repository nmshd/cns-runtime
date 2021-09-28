import { EventEmitter2, ListenerFn } from "eventemitter2";
import "reflect-metadata";
import { Event } from "../../events/Event";
import { EventBus, EventHandler, getEventNamespaceFromObject, SubscriptionTarget } from "../EventBus";
import { SubscriptionTargetInfo } from "../SubscriptionTargetInfo";

export class EventEmitter2EventBus implements EventBus {
    private readonly emitter: EventEmitter2;

    private readonly wrappers = new Map<number, ListenerFn>();
    private nextId = 0;

    public constructor() {
        this.emitter = new EventEmitter2({ wildcard: true, maxListeners: 50, verboseMemoryLeak: true });
    }

    public subscribe<TEvent = any>(subscriptionTarget: SubscriptionTarget, handler: EventHandler<TEvent>): number {
        return this.registerHandler(subscriptionTarget, handler);
    }

    public subscribeOnce<TEvent = any>(subscriptionTarget: SubscriptionTarget, handler: EventHandler<TEvent>): number {
        return this.registerHandler(subscriptionTarget, handler, true);
    }

    public unsubscribe(subscriptionTarget: SubscriptionTarget, subscriptionId: number): boolean {
        return this.unregisterHandler(subscriptionTarget, subscriptionId);
    }

    private registerHandler<TEvent>(subscriptionTarget: SubscriptionTarget, handler: EventHandler<TEvent>, isOneTimeHandler = false): number {
        const subscriptionTargetInfo = SubscriptionTargetInfo.from(subscriptionTarget);
        const handlerId = this.nextId++;

        const handlerWrapper = (event: TEvent) => {
            if (!subscriptionTargetInfo.isCompatibleWith(event)) {
                return;
            }

            handler(event);

            if (isOneTimeHandler) {
                this.unsubscribe(subscriptionTarget, handlerId);
            }
        };

        this.wrappers.set(handlerId, handlerWrapper);

        this.emitter.on(subscriptionTargetInfo.namespace, handlerWrapper);
        return handlerId;
    }

    private unregisterHandler(subscriptionTarget: SubscriptionTarget, handlerId: number): boolean {
        const subscriptionTargetInfo = SubscriptionTargetInfo.from(subscriptionTarget);
        const handlerWrapper = this.wrappers.get(handlerId);
        if (!handlerWrapper) {
            return false;
        }

        this.emitter.off(subscriptionTargetInfo.namespace, handlerWrapper);
        this.wrappers.delete(handlerId);
        return true;
    }

    public publish(event: Event): void {
        const namespace = getEventNamespaceFromObject(event);

        if (!namespace) {
            throw Error("The event needs a namespace. Use the EventNamespace-decorator in order to define a namespace for a event.");
        }

        this.emitter.emit(namespace, event);
    }
}
