import { AbstractAttributeValueJSON, IdentityAttributeJSON, RelationshipAttributeJSON } from "@nmshd/content";

interface ExtendedAttributeValue extends AbstractAttributeValueJSON, Record<string, unknown> {}

export interface ExtendedIdentityAttributeJSON extends IdentityAttributeJSON {
    value: ExtendedAttributeValue;
}
export interface ExtendedRelationshipAttributeJSON extends RelationshipAttributeJSON {
    value: ExtendedAttributeValue;
}
