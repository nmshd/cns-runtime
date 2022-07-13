import { Event } from "@js-soft/ts-utils";

export class TransportLibraryInitializingEvent extends Event {
    public static readonly namespace = "transport.initializing";

    public constructor() {
        super(TransportLibraryInitializingEvent.namespace);
    }
}
