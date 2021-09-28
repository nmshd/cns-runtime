import { RelationshipTheme } from "@nmshd/consumption";
import { RelationshipThemeDTO } from "../../../types";

export class RelationshipThemeMapper {
    public static toRelationshipThemeDTO(relationshipTheme: RelationshipTheme): RelationshipThemeDTO {
        return {
            image: relationshipTheme.image,
            imageBar: relationshipTheme.imageBar,
            backgroundColor: relationshipTheme.backgroundColor,
            foregroundColor: relationshipTheme.foregroundColor
        };
    }

    public static toRelationshipThemeDTOList(relationshipThemes: RelationshipTheme[]): RelationshipThemeDTO[] {
        return relationshipThemes.map((elem) => this.toRelationshipThemeDTO(elem));
    }
}
