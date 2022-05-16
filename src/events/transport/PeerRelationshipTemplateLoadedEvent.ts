import { RelationshipTemplateDTO } from "../../types";
import { DataEvent } from "../DataEvent";

export class PeerRelationshipTemplateLoadedEvent extends DataEvent<RelationshipTemplateDTO> {
    public static readonly namespace = "transport.peerRelationshipTemplateLoaded";

    public constructor(eventTargetAddress: string, data: RelationshipTemplateDTO) {
        super(PeerRelationshipTemplateLoadedEvent.namespace, eventTargetAddress, data);
    }
}
