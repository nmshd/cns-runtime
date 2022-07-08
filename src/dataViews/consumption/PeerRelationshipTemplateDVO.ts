import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport";
import { LocalRequestDVO } from "./LocalRequestDVO";

export interface PeerRelationshipTemplateDVO extends DataViewObject {
    type: "PeerRelationshipTemplateDVO";
    isOwn: boolean;
    createdBy: IdentityDVO;
    createdByDevice: string;
    createdAt: string;
    expiresAt?: string;
    maxNumberOfAllocations?: number;

    /**
     * Is optional, as there can be RelationshipTemplates without actual requests in it
     */
    onNewRelationship?: LocalRequestDVO;
    onExistingRelationship?: LocalRequestDVO;

    content: any;
}
