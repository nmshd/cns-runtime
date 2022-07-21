import { LokiJsConnection } from "@js-soft/docdb-access-loki";
import { MongoDbConnection } from "@js-soft/docdb-access-mongo";
import { NodeLoggerFactory } from "@js-soft/node-logger";
import { EventEmitter2EventBus } from "@js-soft/ts-utils";
import { ConsumptionController } from "@nmshd/consumption";
import { AccountController, Transport } from "@nmshd/transport";
import { DatabaseSchemaUpgrader } from "../../src/DatabaseSchemaUpgrader";
import { RuntimeServiceProvider } from "../lib/RuntimeServiceProvider";

let databaseConnection: MongoDbConnection | LokiJsConnection;
let accountController: AccountController;
let consumptionController: ConsumptionController;

beforeAll(async () => {
    if (process.env.USE_LOKIJS === "true") {
        databaseConnection = new LokiJsConnection("./db");
    } else {
        databaseConnection = new MongoDbConnection(process.env.CONNECTION_STRING!);
        await databaseConnection.connect();
    }

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

    const transport = new Transport(databaseConnection, RuntimeServiceProvider.defaultConfig.transportLibrary, new EventEmitter2EventBus(), loggerFactory);

    const randomAccountName = Math.random().toString(36).substring(7);
    const db = await transport.createDatabase(`acc-${randomAccountName}`);

    accountController = await new AccountController(transport, db, transport.config).init();
    consumptionController = await new ConsumptionController(transport, accountController).init();
}, 30000);

afterAll(async () => {
    await accountController.close();
    await databaseConnection.close();
});

describe("DatabaseSchemaUpgrader", () => {
    test("should write the current version to the database during startup", async () => {
        await new DatabaseSchemaUpgrader(accountController, consumptionController).upgradeSchemaVersion();

        const metaCollection = await accountController.db.getCollection("meta");
        const doc = await metaCollection.findOne({ id: "databaseSchema" });

        expect(doc).toBeDefined();
        expect(doc.version).toBeGreaterThan(0);
    });
});
