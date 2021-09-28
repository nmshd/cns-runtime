import { Event } from "../Event";

export class RuntimeInitializedEvent extends Event {
    public static readonly namespace = "runtime.initialized";

    public constructor() {
        super(RuntimeInitializedEvent.namespace);
    }
}
