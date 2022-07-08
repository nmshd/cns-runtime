import { IdentityAttributeJSON, RelationshipAttributeCreationHintsJSON, RelationshipAttributeJSON, RenderHintsJSON, ValueHintsJSON } from "@nmshd/content";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport";

export interface DraftAttributeDVO extends DataViewObject {
    type: "DraftAttributeDVO";
    content: IdentityAttributeJSON | RelationshipAttributeJSON;
    owner: IdentityDVO;
    renderHints: RenderHintsJSON;
    valueHints: ValueHintsJSON;
    isOwn: boolean;
    isDraft: true;
    succeeds?: string;
    succeededBy?: string;
    value: unknown;
}

export interface AttributeQueryDVO extends DataViewObject {
    name: string;
    description?: string;
    valueType: string;
    validFrom?: string;
    validTo?: string;
    renderHints: RenderHintsJSON;
    valueHints: ValueHintsJSON;
}

export interface IdentityAttributeQueryDVO extends AttributeQueryDVO {
    type: "IdentityAttributeQueryDVO";
    tags?: string[];
    isProcessed: false;
}
export interface RelationshipAttributeQueryDVO extends AttributeQueryDVO {
    type: "RelationshipAttributeQueryDVO";
    key: string;
    owner: IdentityDVO;
    thirdParty?: IdentityDVO;
    attributeCreationHints: RelationshipAttributeCreationHintsJSON;
    isProcessed: false;
}
