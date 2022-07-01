import { LocalAttribute, LocalAttributeShareInfoJSON } from "@nmshd/consumption";
import { LocalAttributeDTO } from "../../../types";

export class AttributeMapper {
    public static toAttributeDTO(attribute: LocalAttribute): LocalAttributeDTO {
        return {
            id: attribute.id.toString(),
            content: attribute.content.toJSON(),
            createdAt: attribute.createdAt.toString(),
            succeeds: attribute.succeeds?.toString(),
            succeededBy: attribute.succeededBy?.toString(),
            shareInfo: attribute.shareInfo?.toJSON() as LocalAttributeShareInfoJSON
        };
    }

    public static toAttributeDTOList(attributes: LocalAttribute[]): LocalAttributeDTO[] {
        return attributes.map((attribute) => this.toAttributeDTO(attribute));
    }
}
