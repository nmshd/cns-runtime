import { RelationshipInfo } from "@nmshd/consumption";
import { RelationshipInfoDTO } from "../../../types";
import { RelationshipAttributeMapper } from "./RelationshipAttributeMapper";
import { RelationshipThemeMapper } from "./RelationshipThemeMapper";

export class RelationshipInfoMapper {
    public static toRelationshipInfoDTO(relationshipInfo: RelationshipInfo): RelationshipInfoDTO {
        return {
            id: relationshipInfo.id.toString(),
            relationshipId: relationshipInfo.relationshipId.toString(),
            attributes: RelationshipAttributeMapper.toRelationshipAttributeDTOList(relationshipInfo.attributes),
            isPinned: relationshipInfo.isPinned,
            title: relationshipInfo.title,
            description: relationshipInfo.description,
            userTitle: relationshipInfo.userTitle,
            userDescription: relationshipInfo.userDescription,
            theme: relationshipInfo.theme ? RelationshipThemeMapper.toRelationshipThemeDTO(relationshipInfo.theme) : undefined
        };
    }

    public static toRelationshipInfoDTOList(relationshipInfoList: RelationshipInfo[]): RelationshipInfoDTO[] {
        return relationshipInfoList.map((elem) => this.toRelationshipInfoDTO(elem));
    }
}
