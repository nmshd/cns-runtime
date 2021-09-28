import { RelationshipTemplateDTO } from "../../types";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "./IdentityDVO";

export interface RelationshipTemplateDVOProperties extends RelationshipTemplateDTO {
    createdByObject: IdentityDVO;
}

export interface RelationshipTemplateDVO extends DataViewObject {
    template: RelationshipTemplateDVOProperties;
}
