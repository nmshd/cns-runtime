import { AbstractValidator } from "fluent-ts-validator";

export class RuntimeValidator<T = any> extends AbstractValidator<T> {
    public constructor() {
        super();

        this.validateIfAny((x) => x)
            .isDefined()
            .withFailureMessage("request is undefined");
    }
}
