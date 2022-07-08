import { RequestDVO } from "../content";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "./IdentityDVO";

export interface RelationshipTemplateDVO extends DataViewObject {
    type: "RelationshipTemplateDVO";
    isOwn: boolean;
    createdBy: IdentityDVO;
    createdByDevice: string;
    createdAt: string;
    expiresAt?: string;
    maxNumberOfAllocations?: number;

    /**
     * Is optional, as there can be RelationshipTemplates without actual requests in it
     */
    onNewRelationship?: RequestDVO;
    onExistingRelationship?: RequestDVO;

    content: unknown;
}
