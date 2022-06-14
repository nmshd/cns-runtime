import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "./IdentityDVO";

export interface RelationshipTemplateDVO extends DataViewObject {
    isOwn: boolean;
    createdBy: IdentityDVO;
    createdByDevice: string;
    createdAt: string;
    expiresAt?: string;
    maxNumberOfAllocations?: number;
    maxNumberOfRelationships?: number;

    content: any;
}
