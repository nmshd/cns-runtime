import { Event } from "../Event";

export class ModulesInitializedEvent extends Event {
    public static readonly namespace = "runtime.modulesInitialized";

    public constructor() {
        super(ModulesInitializedEvent.namespace);
    }
}
