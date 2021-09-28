import { Event } from "../Event";

export class TransportLibraryInitializingEvent extends Event {
    public static readonly namespace = "transport.initializing";

    public constructor() {
        super(TransportLibraryInitializingEvent.namespace);
    }
}
