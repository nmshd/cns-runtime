import { ConsumptionAttributeShareInfoJSON } from "@nmshd/consumption/dist/modules/attributes/local/ConsumptionAttributeShareInfo";
import { IdentityAttributeJSON, RelationshipAttributeJSON } from "@nmshd/content";

export interface ConsumptionAttributeDTO {
    id: string;
    attributeType: string;
    valueType: string;
    content: IdentityAttributeJSON | RelationshipAttributeJSON;
    createdAt: string;
    succeeds?: string;
    sucessor?: string;
    shareInfo?: ConsumptionAttributeShareInfoJSON;
}
