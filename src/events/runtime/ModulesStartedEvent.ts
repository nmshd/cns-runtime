import { Event } from "../Event";

export class ModulesStartedEvent extends Event {
    public static readonly namespace = "runtime.modulesStarted";

    public constructor() {
        super(ModulesStartedEvent.namespace);
    }
}
