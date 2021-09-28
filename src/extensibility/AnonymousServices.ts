import { Inject } from "typescript-ioc";
import { AnonymousTokensFacade } from "./facades/anonymous";

export class AnonymousServices {
    public constructor(@Inject public readonly tokens: AnonymousTokensFacade) {}
}
