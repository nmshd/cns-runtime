import { ILogger, ILoggerFactory } from "@js-soft/logging-abstractions";

export abstract class RuntimeLoggerFactory implements ILoggerFactory {
    abstract getLogger(name: string | Function): ILogger;
}
