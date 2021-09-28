import { Event } from "./Event";

export class DataEvent<T> extends Event {
    public constructor(namespace: string, public readonly data: T) {
        super(namespace);
    }
}
