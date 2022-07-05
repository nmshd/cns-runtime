import { IdentityAttributeJSON, RelationshipAttributeCreationHintsJSON, RelationshipAttributeJSON, RenderHintsJSON, ValueHintsJSON } from "@nmshd/content";
import { AttributeQueryDVO } from "../content/AttributeDVOs";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport";

export interface LocalAttributeDVO extends DataViewObject {
    content: IdentityAttributeJSON | RelationshipAttributeJSON;
    owner: IdentityDVO;

    key?: string;
    tags?: string[];
    value: any;

    renderHints: RenderHintsJSON;
    valueHints: ValueHintsJSON;

    isDraft: false;
    isOwn: boolean;
    isValid: boolean;

    createdAt: string;
    succeeds?: string;
    succeededBy?: string;
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

export interface ProcessedAttributeQueryDVO extends AttributeQueryDVO {
    results: (RepositoryAttributeDVO | SharedToPeerAttributeDVO)[];
    isProcessed: true;
}

export interface ProcessedIdentityAttributeQueryDVO extends ProcessedAttributeQueryDVO {
    type: "ProcessedIdentityAttributeQueryDVO";
    tags?: string[];
}
export interface ProcessedRelationshipAttributeQueryDVO extends ProcessedAttributeQueryDVO {
    type: "ProcessedRelationshipAttributeQueryDVO";
    key: string;
    owner: IdentityDVO;
    thirdParty?: IdentityDVO;
    attributeCreationHints: RelationshipAttributeCreationHintsJSON;
}
