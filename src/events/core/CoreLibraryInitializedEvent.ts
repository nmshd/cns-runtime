import { Event } from "../Event";

export class CoreLibraryInitializedEvent extends Event {
    public static readonly namespace = "core.initialized";

    public constructor() {
        super(CoreLibraryInitializedEvent.namespace);
    }
}
