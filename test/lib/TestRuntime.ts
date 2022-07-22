import { IDatabaseConnection } from "@js-soft/docdb-access-abstractions";
import { LokiJsConnection } from "@js-soft/docdb-access-loki";
import { MongoDbConnection } from "@js-soft/docdb-access-mongo";
import { ILoggerFactory } from "@js-soft/logging-abstractions";
import { NodeLoggerFactory } from "@js-soft/node-logger";
import { ConsumptionController, GenericRequestItemProcessor } from "@nmshd/consumption";
import { AccountController, ICoreAddress } from "@nmshd/transport";
import { ConsumptionServices, DataViewExpander, ModuleConfiguration, Runtime, RuntimeHealth, RuntimeServices, TransportServices } from "../../src";
import { TestRequestItem } from "../consumption/TestRequestItem";

export class TestRuntime extends Runtime {
    private dbConnection?: MongoDbConnection | LokiJsConnection;

    private _transportServices: TransportServices;
    private _consumptionServices: ConsumptionServices;
    private _dataViewExpander: DataViewExpander;

    public getServices(_address: string | ICoreAddress): RuntimeServices {
        // ignoring the address b/c we only have one account in the test runtime

        return {
            transportServices: this._transportServices,
            consumptionServices: this._consumptionServices,
            dataViewExpander: this._dataViewExpander
        };
    }

    protected createLoggerFactory(): ILoggerFactory {
        return new NodeLoggerFactory({
            appenders: {
                consoleAppender: {
                    type: "stdout",
                    layout: { type: "pattern", pattern: "%[[%d] [%p] %c - %m%]" }
                },
                console: {
                    type: "logLevelFilter",
                    level: "ERROR",
                    appender: "consoleAppender"
                }
            },

            categories: {
                default: {
                    appenders: ["console"],
                    level: "TRACE"
                }
            }
        });
    }

    protected async createDatabaseConnection(): Promise<IDatabaseConnection> {
        if (this.dbConnection) {
            throw new Error("DbConnection already created");
        }

        if (process.env.USE_LOKIJS === "true") {
            this.dbConnection = LokiJsConnection.inMemory();
        } else {
            this.dbConnection = new MongoDbConnection(process.env.CONNECTION_STRING!);
            await this.dbConnection.connect();
        }

        return this.dbConnection;
    }

    protected async initAccount(): Promise<void> {
        const randomAccountName = Math.random().toString(36).substring(7);
        const db = await this.transport.createDatabase(`acc-${randomAccountName}`);

        const accountController = await new AccountController(this.transport, db, this.transport.config).init();

        const requestItemProcessorOverrides = new Map([[TestRequestItem, GenericRequestItemProcessor]]);
        const consumptionController = await new ConsumptionController(this.transport, accountController).init(requestItemProcessorOverrides);

        ({
            transportServices: this._transportServices,
            consumptionServices: this._consumptionServices,
            dataViewExpander: this._dataViewExpander
        } = await this.login(accountController, consumptionController));
    }

    public getHealth(): Promise<RuntimeHealth> {
        return Promise.resolve({ isHealthy: true, services: {} });
    }

    protected loadModule(_moduleConfiguration: ModuleConfiguration): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async stop(): Promise<void> {
        if (this.isInitialized) {
            try {
                await super.stop();
            } catch (e) {
                this.logger.error(e);
            }
        }

        await this.dbConnection?.close();
    }
}

export class NoLoginTestRuntime extends TestRuntime {
    protected async initAccount(): Promise<void> {
        // Do not login
    }
}
