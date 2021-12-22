import { DataViewObject } from "../DataViewObject";

export interface RelationshipDVO extends DataViewObject {
    type: "RelationshipDVO";
    status: string;
    isPinned: boolean;
    theme: RelationshipTheme;
}

export interface RelationshipTheme {
    image?: string;
    headerImage?: string;
    backgroundColor?: string;
    foregroundColor?: string;
}
