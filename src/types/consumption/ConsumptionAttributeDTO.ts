import { IdentityAttributeJSON, RelationshipAttributeJSON } from "@nmshd/content";

export interface ConsumptionAttributeDTO {
    id: string;
    attributeType: string;
    valueType: string;
    content: IdentityAttributeJSON | RelationshipAttributeJSON;
    createdAt: string;
    succeeds?: string;
    sucessor?: string;
    sharedWithPeer?: string;
    sharedFromSourceAttribute: string;
}
