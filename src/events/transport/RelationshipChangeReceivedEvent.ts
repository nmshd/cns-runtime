import { RelationshipDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RelationshipChangeReceivedEvent extends DataEvent<RelationshipDTO> {
    public static readonly namespace = "transport.relationshipChangeReceived";

    public constructor(address: string, data: RelationshipDTO) {
        super(RelationshipChangeReceivedEvent.namespace, address, data);
    }
}
