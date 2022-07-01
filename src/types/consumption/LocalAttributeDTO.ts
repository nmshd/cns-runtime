import { LocalAttributeShareInfoJSON } from "@nmshd/consumption";
import { IdentityAttributeJSON, RelationshipAttributeJSON } from "@nmshd/content";

export interface LocalAttributeDTO {
    id: string;
    createdAt: string;
    content: IdentityAttributeJSON | RelationshipAttributeJSON;
    succeeds?: string;
    succeededBy?: string;
    shareInfo?: LocalAttributeShareInfoJSON;
}
