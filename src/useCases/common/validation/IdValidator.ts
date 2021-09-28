import { CoreIdHelper } from "@nmshd/transport";
import { AbstractValidator } from "fluent-ts-validator";

export class IdValidator extends AbstractValidator<string> {
    protected constructor(nullable: boolean, helper: CoreIdHelper) {
        super();

        let rule = this.validateIfString((x) => x);

        if (!nullable) {
            rule = rule.isNotNull();
        }

        rule = rule.fulfills((x) => helper.validate(x));

        if (nullable) {
            rule.whenNotNull();
        }
    }

    public static required(helper: CoreIdHelper): IdValidator {
        return new IdValidator(false, helper);
    }

    public static optional(helper: CoreIdHelper): IdValidator {
        return new IdValidator(true, helper);
    }
}
