import { ConsumptionAttribute } from "@nmshd/consumption";
import { AttributeJSON } from "@nmshd/content";
import { ConsumptionAttributeDTO } from "../../../types";
import { GetAttributesByNamesResponse } from "./GetAttributesByNames";

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

    public static toGetAttributesByNamesResponse(attributesByNames: Record<string, ConsumptionAttribute>): GetAttributesByNamesResponse {
        const response: GetAttributesByNamesResponse = {};
        for (const name in attributesByNames) {
            response[name] = AttributeMapper.toAttributeDTO(attributesByNames[name]);
        }

        return response;
    }
}
