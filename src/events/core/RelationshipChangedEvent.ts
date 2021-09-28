import { RelationshipDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class RelationshipChangedEvent extends DataEvent<RelationshipDTO> {
    public static readonly namespace = "core.relationshipChanged";

    public constructor(data: RelationshipDTO) {
        super(RelationshipChangedEvent.namespace, data);
    }
}
