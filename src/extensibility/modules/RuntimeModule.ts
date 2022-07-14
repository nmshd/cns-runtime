import { ILogger } from "@js-soft/logging-abstractions";
import { EventHandler, SubscriptionTarget } from "@js-soft/ts-utils";
import { Runtime } from "../../Runtime";

export interface ModuleConfiguration {
    enabled: boolean;
    name: string;
    displayName: string;
    location: string;
}

export abstract class RuntimeModule<TConfig extends ModuleConfiguration = ModuleConfiguration, TRuntime extends Runtime = Runtime> {
    public constructor(public readonly runtime: TRuntime, public readonly configuration: TConfig, public readonly logger: ILogger) {}

    public get name(): string {
        return this.configuration.name;
    }

    public get displayName(): string {
        return this.configuration.displayName;
    }

    public abstract init(): Promise<void> | void;
    public abstract start(): Promise<void> | void;
    public abstract stop(): Promise<void> | void;

    private readonly subscriptionIds: number[] = [];

    protected subscribeToEvent<TEvent>(event: SubscriptionTarget<TEvent>, handler: EventHandler<TEvent>): void {
        const subscriptionId = this.runtime.eventBus.subscribe(event, handler);
        this.subscriptionIds.push(subscriptionId);
    }

    protected unsubscribeFromAllEvents(): void {
        this.subscriptionIds.forEach((id) => this.runtime.eventBus.unsubscribe(id));
        this.subscriptionIds.splice(0);
    }
}
