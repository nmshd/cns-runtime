import { Event } from "@js-soft/ts-utils";

export class ModulesInitializedEvent extends Event {
    public static readonly namespace = "runtime.modulesInitialized";

    public constructor() {
        super(ModulesInitializedEvent.namespace);
    }
}
