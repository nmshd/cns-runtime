import { Event } from "@js-soft/ts-utils";

export class TransportLibraryInitializedEvent extends Event {
    public static readonly namespace = "transport.initialized";

    public constructor() {
        super(TransportLibraryInitializedEvent.namespace);
    }
}
