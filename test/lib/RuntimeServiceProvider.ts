import { AnonymousServices, ConsumptionServices, DataViewExpander, RuntimeConfig, TransportServices } from "../../src";
import { TestRuntime } from "./TestRuntime";

export interface RuntimeServices {
    transport: TransportServices;
    consumption: ConsumptionServices;
    anonymous: AnonymousServices;
    expander: DataViewExpander;
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
        modules: {}
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

            runtimeServices.push({
                transport: runtime.transportServices,
                consumption: runtime.consumptionServices,
                anonymous: runtime.anonymousServices,
                expander: runtime.dataViewExpander
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
