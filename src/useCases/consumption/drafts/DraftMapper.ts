import { Draft } from "@nmshd/consumption";
import { DraftDTO } from "../../../types";

export class DraftMapper {
    public static toDraftDTO(attribute: Draft): DraftDTO {
        return {
            id: attribute.id.toString(),
            type: attribute.type,
            createdAt: attribute.createdAt.toString(),
            lastModifiedAt: attribute.lastModifiedAt.toISOString(),
            content: attribute.content.toJSON()
        };
    }

    public static toDraftDTOList(attributes: Draft[]): DraftDTO[] {
        return attributes.map((attribute) => this.toDraftDTO(attribute));
    }
}
