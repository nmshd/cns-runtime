import { ConsumptionIds } from "@nmshd/consumption";
import { AbstractValidator } from "fluent-ts-validator";
import { RelationshipAttributeDTO } from "../../../types";

export class RelationshipAttributeDTOValidator extends AbstractValidator<RelationshipAttributeDTO> {
    private constructor() {
        super();

        this.validateIfString((x) => x.sharedItem).fulfills((x) => ConsumptionIds.sharedItem.validate(x));
    }

    public static required(): RelationshipAttributeDTOValidator {
        return new RelationshipAttributeDTOValidator();
    }
}
