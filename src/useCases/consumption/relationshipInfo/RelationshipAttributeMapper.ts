import { RelationshipAttribute } from "@nmshd/consumption";
import { AttributeJSON } from "@nmshd/content";
import { RelationshipAttributeDTO } from "../../../types";

export class RelationshipAttributeMapper {
    public static toRelationshipAttributeDTO(relationshipAttribute: RelationshipAttribute): RelationshipAttributeDTO {
        return {
            name: relationshipAttribute.name,
            content: relationshipAttribute.content.toJSON() as AttributeJSON,
            sharedItem: relationshipAttribute.sharedItem.toString()
        };
    }

    public static toRelationshipAttributeDTOList(relationshipAttributes: RelationshipAttribute[]): RelationshipAttributeDTO[] {
        return relationshipAttributes.map((elem) => this.toRelationshipAttributeDTO(elem));
    }
}
