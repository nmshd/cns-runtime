import { RuntimeServiceProvider } from "../lib/RuntimeServiceProvider";
import { TestRuntime } from "../lib/TestRuntime";

const runtimeServiceProvider = new RuntimeServiceProvider();
let runtime: TestRuntime;

beforeAll(async () => {
    runtime = await runtimeServiceProvider.launchUnsafe();
}, 30000);
afterAll(async () => await runtimeServiceProvider.stop());

describe("DatabaseSchemaUpgrader", () => {
    test("should write version 1 to the database during startup", async () => {
        const collection = await runtime.accountController.db.getCollection("meta");
        const doc = await collection.findOne({ id: "databaseSchema" });

        expect(doc).toBeDefined();
        expect(doc.version).toBeGreaterThan(0);
    });
});
