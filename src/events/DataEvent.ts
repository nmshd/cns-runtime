import { Event } from "@js-soft/ts-utils";

export class DataEvent<T> extends Event {
    public constructor(namespace: string, public readonly eventTargetAddress: string, public readonly data: T) {
        super(namespace);
    }
}
