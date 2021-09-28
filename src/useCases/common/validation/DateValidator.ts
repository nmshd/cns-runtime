import { AbstractValidator } from "fluent-ts-validator";
import { DateTime } from "luxon";

export class DateValidator extends AbstractValidator<string> {
    private constructor(nullable: boolean) {
        super();

        let rule = this.validateIfString((x) => x);

        if (!nullable) {
            rule = rule.isNotNull();
        }

        rule = rule.fulfills((e) => DateTime.fromISO(e).isValid);

        if (nullable) {
            rule.whenNotNull();
        }
    }

    public static required(): DateValidator {
        return new DateValidator(false);
    }

    public static optional(): DateValidator {
        return new DateValidator(true);
    }
}
