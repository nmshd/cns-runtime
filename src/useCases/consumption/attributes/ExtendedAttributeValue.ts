import { AbstractAttributeValueJSON, IdentityAttributeJSON, RelationshipAttributeJSON } from "@nmshd/content";

interface ExtendedValue extends AbstractAttributeValueJSON, Record<string, unknown> {}

export interface ExtendedIdentityAttributeJSON extends IdentityAttributeJSON {
    value: ExtendedValue;
}
export interface ExtendedRelationshipAttributeJSON extends RelationshipAttributeJSON {
    value: ExtendedValue;
}
