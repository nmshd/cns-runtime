import { Event } from "../Event";

export class RuntimeInitializingEvent extends Event {
    public static readonly namespace = "runtime.initializing";

    public constructor() {
        super(RuntimeInitializingEvent.namespace);
    }
}
