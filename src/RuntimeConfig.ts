import { IConfigOverwrite, Realm } from "@nmshd/transport";
import { ModuleConfiguration } from "./extensibility/modules/RuntimeModule";

export interface RuntimeConfig {
    debug: boolean;

    realm: Realm;

    transportLibrary: IConfigOverwrite;

    consumptionLibrary: {};

    eventBus: {};

    modules: Record<string, ModuleConfiguration>;
}
