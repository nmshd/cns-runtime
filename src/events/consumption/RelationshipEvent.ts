import { Event } from "@js-soft/ts-utils";
import { RelationshipDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RelationshipEvent extends DataEvent<RelationshipDTO> {
    public static readonly namespace = "consumption.relationshipEvent.";

    public constructor(eventTargetAddress: string, public readonly event: Event, data: RelationshipDTO) {
        super(RelationshipEvent.namespace + data.id, eventTargetAddress, data);
    }
}
