import { RelationshipDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RelationshipChangedEvent extends DataEvent<RelationshipDTO> {
    public static readonly namespace = "transport.relationshipChanged";

    public constructor(address: string, data: RelationshipDTO) {
        super(RelationshipChangedEvent.namespace, address, data);
    }
}
