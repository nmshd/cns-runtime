import { IdentityAttributeJSON, RelationshipAttributeCreationHintsJSON, RelationshipAttributeJSON, RenderHintsJSON, ValueHintsJSON } from "@nmshd/content";
import { AttributeQueryDVO } from "../content/AttributeDVOs";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "../transport";

/**
 * The DataViewObject representation of a LocalAttribute
 * @abstract
 */
export interface LocalAttributeDVO extends DataViewObject {
    content: IdentityAttributeJSON | RelationshipAttributeJSON;
    owner: IdentityDVO;

    key?: string;
    tags: string[];
    value: unknown;
    valueType: string;

    renderHints: RenderHintsJSON;
    valueHints: ValueHintsJSON;

    isDraft: false;
    isOwn: boolean;
    isValid: boolean;

    createdAt: string;
    succeeds?: string;
    succeededBy?: string;
}

/**
 * Original own LocalAttribute DataViewObject
 */
export interface RepositoryAttributeDVO extends LocalAttributeDVO {
    type: "RepositoryAttributeDVO";
    sharedWith: SharedToPeerAttributeDVO[];
    isOwn: true;
}

/**
 * LocalAttribute DataViewObject which is shared to a peer
 */
export interface SharedToPeerAttributeDVO extends LocalAttributeDVO {
    type: "SharedToPeerAttributeDVO";
    peer: IdentityDVO;
    requestReference: string;
    sourceAttribute: string;
    isOwn: true;
}

/**
 * LocalAttribute DataViewObject which was received from a peer
 */
export interface PeerAttributeDVO extends LocalAttributeDVO {
    type: "PeerAttributeDVO";
    peer: IdentityDVO;
    requestReference: string;
    isOwn: false;
}

/**
 * The DataViewObject representation of a processed AttributeQuery.
 * A processed AttributeQuery contains the potential LocalAttributes
 * which fit to this query within the `results` property.
 * @abstract
 */
export interface ProcessedAttributeQueryDVO extends AttributeQueryDVO {
    results: (RepositoryAttributeDVO | SharedToPeerAttributeDVO)[];
    isProcessed: true;
}

/**
 * The DataViewObject representation of a processed IdentityAttributeQuery.
 * A processed AttributeQuery contains the potential LocalAttributes
 * which fit to this query within the `results` property.
 */
export interface ProcessedIdentityAttributeQueryDVO extends ProcessedAttributeQueryDVO {
    type: "ProcessedIdentityAttributeQueryDVO";
    tags?: string[];
}

/**
 * The DataViewObject representation of a processed RelationshipAttributeQuery.
 * A processed AttributeQuery contains the potential LocalAttributes
 * which fit to this query within the `results` property.
 */
export interface ProcessedRelationshipAttributeQueryDVO extends ProcessedAttributeQueryDVO {
    type: "ProcessedRelationshipAttributeQueryDVO";
    key: string;
    owner: IdentityDVO;
    thirdParty?: IdentityDVO;
    attributeCreationHints: RelationshipAttributeCreationHintsJSON;
}
