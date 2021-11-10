import { ILogger, ILoggerFactory } from "@js-soft/logging-abstractions";

export abstract class RuntimeLoggerFactory implements ILoggerFactory {
    public abstract getLogger(name: string | Function): ILogger;
}
