import { Inject } from "typescript-ioc";
import { AccountFacade, DevicesFacade, FilesFacade, MessagesFacade, RelationshipsFacade, RelationshipTemplatesFacade, TokensFacade } from "./facades/core";

export class CoreServices {
    public constructor(
        @Inject public readonly files: FilesFacade,
        @Inject public readonly messages: MessagesFacade,
        @Inject public readonly relationships: RelationshipsFacade,
        @Inject public readonly relationshipTemplates: RelationshipTemplatesFacade,
        @Inject public readonly tokens: TokensFacade,
        @Inject public readonly account: AccountFacade,
        @Inject public readonly devices: DevicesFacade
    ) {}
}
