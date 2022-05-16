import { EventBus } from "@js-soft/ts-utils";
import { AnonymousServices, ConsumptionServices, DataViewExpander, RuntimeConfig, TransportServices } from "../../src";
import { TestRuntime } from "./TestRuntime";

export interface RuntimeServices {
    transport: TransportServices;
    consumption: ConsumptionServices;
    anonymous: AnonymousServices;
    expander: DataViewExpander;
    eventBus: EventBus;
}

export interface LaunchConfiguration {
    enableDatawallet?: boolean;
}

export class RuntimeServiceProvider {
    private readonly runtimes: TestRuntime[] = [];

    private static readonly _runtimeConfig: RuntimeConfig = {
        transportLibrary: {
            baseUrl: "https://stage.enmeshed.eu",
            platformClientId: "test",
            platformClientSecret: "a6owPRo8c98Ue8Z6mHoNgg5viF5teD",
            debug: true
        },
        modules: {
            deciderModule: {
                enabled: true,
                displayName: "Decider Module",
                name: "DeciderModule",
                location: "builtin"
            }
        }
    };

    public static get runtimeConfig(): RuntimeConfig {
        const copy = JSON.parse(JSON.stringify(RuntimeServiceProvider._runtimeConfig));
        return copy;
    }

    public async launch(count: number, launchConfiguration: LaunchConfiguration = {}): Promise<RuntimeServices[]> {
        const runtimeServices = [];

        for (let i = 0; i < count; i++) {
            const config = RuntimeServiceProvider.runtimeConfig;

            if (launchConfiguration.enableDatawallet) {
                config.transportLibrary.datawalletEnabled = true;
            }

            const runtime = new TestRuntime(config);
            this.runtimes.push(runtime);

            await runtime.init();
            await runtime.start();

            const services = runtime.getServices("");

            runtimeServices.push({
                transport: services.transportServices,
                consumption: services.consumptionServices,
                anonymous: runtime.anonymousServices,
                expander: services.dataViewExpander,
                eventBus: runtime.eventBus
            });
        }

        return runtimeServices;
    }

    public async stop(): Promise<void> {
        for (const runtime of this.runtimes) {
            await runtime.stop();
        }
    }
}
