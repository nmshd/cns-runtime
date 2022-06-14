import { RelationshipTemplate } from "@nmshd/transport";
import { RelationshipTemplateDTO } from "../../../types";
import { RuntimeErrors } from "../../common";

export class RelationshipTemplateMapper {
    public static toRelationshipTemplateDTO(template: RelationshipTemplate): RelationshipTemplateDTO {
        if (!template.cache) {
            throw RuntimeErrors.general.cacheEmpty(RelationshipTemplate, template.id.toString());
        }

        return {
            id: template.id.toString(),
            isOwn: template.isOwn,
            createdBy: template.cache.createdBy.toString(),
            createdByDevice: template.cache.createdByDevice.toString(),
            createdAt: template.cache.createdAt.toString(),
            content: template.cache.content.toJSON(),
            expiresAt: template.cache.expiresAt?.toString(),
            maxNumberOfAllocations: template.cache.maxNumberOfAllocations,
            maxNumberOfRelationships: template.cache.maxNumberOfRelationships
        };
    }

    public static toRelationshipTemplateDTOList(responseItems: RelationshipTemplate[]): RelationshipTemplateDTO[] {
        return responseItems.map((i) => this.toRelationshipTemplateDTO(i));
    }
}
