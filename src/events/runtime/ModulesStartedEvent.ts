import { Event } from "@js-soft/ts-utils";

export class ModulesStartedEvent extends Event {
    public static readonly namespace = "runtime.modulesStarted";

    public constructor() {
        super(ModulesStartedEvent.namespace);
    }
}
