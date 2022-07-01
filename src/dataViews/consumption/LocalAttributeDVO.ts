import { IdentityAttributeJSON, RelationshipAttributeCreationHintsJSON, RelationshipAttributeJSON, RenderHintsJSON, ValueHintsJSON } from "@nmshd/content";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport";

export interface LocalAttributeDVO extends DataViewObject {
    content: IdentityAttributeJSON | RelationshipAttributeJSON;
    owner: IdentityDVO;
    renderHints: RenderHintsJSON;
    valueHints: ValueHintsJSON;
    isOwn: boolean;
    isValid: boolean;
    createdAt: string;
    succeeds?: string;
    succeededBy?: string;
    value: any;
}

export interface DraftAttributeDVO extends DataViewObject {
    type: "DraftAttributeDVO";
    content: IdentityAttributeJSON | RelationshipAttributeJSON;
    owner: IdentityDVO;
    renderHints: RenderHintsJSON;
    valueHints: ValueHintsJSON;
    succeeds?: string;
    succeededBy?: string;
    value: any;
}
export interface RepositoryAttributeDVO extends LocalAttributeDVO {
    type: "RepositoryAttributeDVO";
    sharedWith: SharedToPeerAttributeDVO[];
    isOwn: true;
}
export interface SharedToPeerAttributeDVO extends LocalAttributeDVO {
    type: "SharedToPeerAttributeDVO";
    peer: IdentityDVO;
    requestReference: string;
    sourceAttribute: string;
    isOwn: true;
}
export interface PeerAttributeDVO extends LocalAttributeDVO {
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
    results: LocalAttributeDVO[];
}
export interface IdentityAttributeQueryExpanded extends AttributeQueryExpanded {
    type: "IdentityAttributeQueryExpanded";
    tags?: string[];
}
export interface RelationshipAttributeQueryExpanded extends AttributeQueryExpanded {
    type: "RelationshipAttributeQueryExpanded";
    key: string;
    owner: IdentityDVO;
    thirdParty?: IdentityDVO;
    attributeCreationHints: RelationshipAttributeCreationHintsJSON;
}
