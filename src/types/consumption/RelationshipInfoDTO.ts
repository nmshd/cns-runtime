import { RelationshipAttributeDTO } from "./RelationshipAttributeDTO";
import { RelationshipThemeDTO } from "./RelationshipThemeDTO";

export interface RelationshipInfoDTO {
    id: string;
    relationshipId: string;
    attributes: RelationshipAttributeDTO[];
    isPinned: boolean;
    title: string;
    description?: string;
    userTitle?: string;
    userDescription?: string;
    theme?: RelationshipThemeDTO;
}
