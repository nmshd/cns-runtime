import { ConsumptionAttribute, ConsumptionAttributeShareInfoJSON } from "@nmshd/consumption";
import { ConsumptionAttributeDTO } from "../../../types";

export class AttributeMapper {
    public static toAttributeDTO(attribute: ConsumptionAttribute): ConsumptionAttributeDTO {
        return {
            id: attribute.id.toString(),
            content: attribute.content.toJSON(),
            createdAt: attribute.createdAt.toString(),
            succeeds: attribute.succeeds?.toString(),
            succeededBy: attribute.succeededBy?.toString(),
            shareInfo: attribute.shareInfo?.toJSON() as ConsumptionAttributeShareInfoJSON
        };
    }

    public static toAttributeDTOList(attributes: ConsumptionAttribute[]): ConsumptionAttributeDTO[] {
        return attributes.map((attribute) => this.toAttributeDTO(attribute));
    }
}
