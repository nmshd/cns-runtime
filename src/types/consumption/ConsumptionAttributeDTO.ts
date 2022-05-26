import { ConsumptionAttributeShareInfoJSON } from "@nmshd/consumption/dist/modules/attributes/local/ConsumptionAttributeShareInfo";
import { IdentityAttributeJSON, RelationshipAttributeJSON } from "@nmshd/content";

export interface ConsumptionAttributeDTO {
    id: string;
    createdAt: string;
    content: IdentityAttributeJSON | RelationshipAttributeJSON;
    succeeds?: string;
    succeededBy?: string;
    shareInfo?: ConsumptionAttributeShareInfoJSON;
}
