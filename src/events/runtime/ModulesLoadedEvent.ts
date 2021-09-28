import { Event } from "../Event";

export class ModulesLoadedEvent extends Event {
    public static readonly namespace = "runtime.modulesLoaded";

    public constructor() {
        super(ModulesLoadedEvent.namespace);
    }
}
