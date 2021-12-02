import { RelationshipDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RelationshipChangeReceivedEvent extends DataEvent<RelationshipDTO> {
    public static readonly namespace = "transport.relationshipChangeReceived";

    public constructor(eventTargetAddress: string, data: RelationshipDTO) {
        super(RelationshipChangeReceivedEvent.namespace, eventTargetAddress, data);
    }
}
