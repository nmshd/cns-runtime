import { AbstractValidator } from "fluent-ts-validator";

export class AddressValidator extends AbstractValidator<string> {
    private constructor(nullable: boolean) {
        super();

        let rule = this.validateIfString((x) => x);

        if (!nullable) {
            rule = rule.isNotNull();
        }

        rule = rule.hasLengthBetween(35, 36);

        if (nullable) {
            rule.whenNotNull();
        }
    }

    public static required(): AddressValidator {
        return new AddressValidator(false);
    }

    public static optional(): AddressValidator {
        return new AddressValidator(true);
    }
}
