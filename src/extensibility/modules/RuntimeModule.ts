import { ILogger } from "@js-soft/logging-abstractions";
import { Runtime } from "../../Runtime";

export interface ModuleConfiguration {
    enabled: boolean;
    name: string;
    displayName: string;
    location: string;
}

export abstract class RuntimeModule<TConfig extends ModuleConfiguration = ModuleConfiguration, TRuntime extends Runtime = Runtime> {
    public runtime: TRuntime;
    public configuration: TConfig;
    public logger: ILogger;

    public get name(): string {
        return this.configuration.name;
    }

    public get displayName(): string {
        return this.configuration.displayName;
    }

    public abstract init(): Promise<void> | void;
    public abstract start(): Promise<void> | void;
    public abstract stop(): Promise<void> | void;
}
