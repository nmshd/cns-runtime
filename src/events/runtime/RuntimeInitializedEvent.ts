import { Event } from "@js-soft/ts-utils";

export class RuntimeInitializedEvent extends Event {
    public static readonly namespace = "runtime.initialized";

    public constructor() {
        super(RuntimeInitializedEvent.namespace);
    }
}
