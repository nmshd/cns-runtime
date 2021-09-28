import { Event } from "../Event";

export class TransportLibraryInitializedEvent extends Event {
    public static readonly namespace = "transport.initialized";

    public constructor() {
        super(TransportLibraryInitializedEvent.namespace);
    }
}
