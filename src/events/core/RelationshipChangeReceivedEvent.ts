import { RelationshipDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RelationshipChangeReceivedEvent extends DataEvent<RelationshipDTO> {
    public static readonly namespace = "core.relationshipChangeReceived";

    public constructor(data: RelationshipDTO) {
        super(RelationshipChangeReceivedEvent.namespace, data);
    }
}
