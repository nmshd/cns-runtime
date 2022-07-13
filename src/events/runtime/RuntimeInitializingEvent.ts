import { Event } from "@js-soft/ts-utils";

export class RuntimeInitializingEvent extends Event {
    public static readonly namespace = "runtime.initializing";

    public constructor() {
        super(RuntimeInitializingEvent.namespace);
    }
}
