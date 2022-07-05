import { RequestDVO } from "../content";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "./IdentityDVO";

export interface RelationshipTemplateDVO extends DataViewObject {
    isOwn: boolean;
    createdBy: IdentityDVO;
    createdByDevice: string;
    createdAt: string;
    expiresAt?: string;
    maxNumberOfAllocations?: number;

    onNewRelationship?: RequestDVO;
    onExistingRelationship?: RequestDVO;

    content: any;
}
