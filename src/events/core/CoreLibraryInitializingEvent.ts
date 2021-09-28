import { Event } from "../Event";

export class CoreLibraryInitializingEvent extends Event {
    public static readonly namespace = "core.initializing";

    public constructor() {
        super(CoreLibraryInitializingEvent.namespace);
    }
}
