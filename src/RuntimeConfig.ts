import { IConfigOverwrite } from "@nmshd/transport";
import { ModuleConfiguration } from "./extensibility/modules/RuntimeModule";

export interface RuntimeConfig {
    transportLibrary: IConfigOverwrite;

    modules: Record<string, ModuleConfiguration>;
}
