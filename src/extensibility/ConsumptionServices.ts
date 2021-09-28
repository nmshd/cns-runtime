import { Inject } from "typescript-ioc";
import { AttributesFacade, DraftsFacade, RelationshipInfoFacade, SettingsFacade, SharedItemsFacade } from "./facades/consumption";

export class ConsumptionServices {
    public constructor(
        @Inject public readonly attributes: AttributesFacade,
        @Inject public readonly drafts: DraftsFacade,
        @Inject public readonly settings: SettingsFacade,
        @Inject public readonly sharedItems: SharedItemsFacade,
        @Inject public readonly relationshipInfo: RelationshipInfoFacade
    ) {}
}
