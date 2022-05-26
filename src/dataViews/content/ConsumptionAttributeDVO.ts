import { IdentityAttributeJSON, RelationshipAttributeHintsJSON, RelationshipAttributeJSON, RenderHintsJSON, ValueHintsJSON } from "@nmshd/content";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport";

export interface ConsumptionAttributeDVO extends DataViewObject {
    content: IdentityAttributeJSON | RelationshipAttributeJSON;
    owner: IdentityDVO;
    renderHints: RenderHintsJSON;
    valueHints: ValueHintsJSON;
    isOwn: boolean;
    isValid: boolean;
    createdAt: string;
    succeeds?: string;
    succeededBy?: string;
}
export interface RepositoryAttributeDVO extends ConsumptionAttributeDVO {
    type: "RepositoryAttributeDVO";
    sharedWith: SharedToPeerAttributeDVO[];
    isOwn: true;
}
export interface SharedToPeerAttributeDVO extends ConsumptionAttributeDVO {
    type: "SharedToPeerAttributeDVO";
    peer: IdentityDVO;
    requestReference: string;
    sourceAttribute: string;
    isOwn: true;
}
export interface PeerAttributeDVO extends ConsumptionAttributeDVO {
    type: "PeerAttributeDVO";
    peer: IdentityDVO;
    requestReference: string;
    isOwn: false;
}
export interface AttributeQueryExpanded {
    type: "IdentityAttributeQueryExpanded" | "RelationshipAttributeQueryExpanded";
    name: string;
    description?: string;
    valueType: string;
    validFrom?: string;
    validTo?: string;
    renderHints: RenderHintsJSON;
    valueHints: ValueHintsJSON;
    results: ConsumptionAttributeDVO[];
}
export interface IdentityAttributeQueryExpanded extends AttributeQueryExpanded {
    type: "IdentityAttributeQueryExpanded";
    tags?: string[];
}
export interface RelationshipAttributeQueryExpanded extends AttributeQueryExpanded {
    type: "RelationshipAttributeQueryExpanded";
    key: string;
    owner: IdentityDVO;
    attributeHints: RelationshipAttributeHintsJSON;
    thirdParty?: IdentityDVO;
}
