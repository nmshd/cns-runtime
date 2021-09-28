import { ConsumptionAttribute } from "@nmshd/consumption";
import { AttributeJSON } from "@nmshd/content";
import { ConsumptionAttributeDTO } from "../../../types";
import { GetAttributesByNameResponse } from "./GetAttributesByName";

export class AttributeMapper {
    public static toAttributeDTO(attribute: ConsumptionAttribute): ConsumptionAttributeDTO {
        return {
            id: attribute.id.toString(),
            content: attribute.content.toJSON() as AttributeJSON,
            createdAt: attribute.createdAt.toString()
        };
    }

    public static toAttributeDTOList(attributes: ConsumptionAttribute[]): ConsumptionAttributeDTO[] {
        return attributes.map((attribute) => this.toAttributeDTO(attribute));
    }

    public static toGetAttributesByNameResponse(attributesByName: Record<string, ConsumptionAttribute>): GetAttributesByNameResponse {
        const response: GetAttributesByNameResponse = {};
        for (const name in attributesByName) {
            response[name] = AttributeMapper.toAttributeDTO(attributesByName[name]);
        }

        return response;
    }
}
