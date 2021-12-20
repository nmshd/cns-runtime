import { IDatabaseConnection } from "@js-soft/docdb-access-abstractions";
import { LokiJsConnection } from "@js-soft/docdb-access-loki";
import { MongoDbConnection } from "@js-soft/docdb-access-mongo";
import { ILoggerFactory } from "@js-soft/logging-abstractions";
import { NodeLoggerFactory } from "@js-soft/node-logger";
import { ConsumptionController } from "@nmshd/consumption";
import { AccountController } from "@nmshd/transport";
import { DataViewExpander, ModuleConfiguration, Runtime, RuntimeHealth } from "../../src";

export class TestRuntime extends Runtime {
    private dbConnection?: MongoDbConnection | LokiJsConnection;

    protected createLoggerFactory(): ILoggerFactory {
        const loggerFactory = new NodeLoggerFactory({
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
        this.logger = loggerFactory.getLogger(Runtime);

        return loggerFactory;
    }

    public get dataViewExpander(): DataViewExpander {
        return this.getDataViewExpander();
    }

    protected async createDatabaseConnection(): Promise<IDatabaseConnection> {
        if (this.dbConnection) {
            throw new Error("DbConnection already created");
        }

        if (process.env.USE_LOKIJS === "true") {
            this.dbConnection = new LokiJsConnection("./db");
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
        const consumptionController = await new ConsumptionController(this.transport, accountController).init();

        this.login(accountController, consumptionController);
    }

    public getHealth(): Promise<RuntimeHealth> {
        return Promise.resolve({ isHealthy: true, services: {} });
    }

    protected loadModule(_moduleConfiguration: ModuleConfiguration): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async stop(): Promise<void> {
        try {
            await super.stop();
        } catch (e) {
            this.logger.error(e);
        }

        await this.dbConnection?.close();
    }
}

export class NoLoginTestRuntime extends TestRuntime {
    protected async initAccount(): Promise<void> {
        // Do not login
    }
}
