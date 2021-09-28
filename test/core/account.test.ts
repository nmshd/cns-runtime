import { DateTime } from "luxon";
import { CoreServices } from "../../src";
import { expectSuccess, RuntimeServiceProvider, uploadFile } from "../lib";

const coreServiceProvider = new RuntimeServiceProvider();
let coreServices: CoreServices;

beforeAll(async () => {
    const runtimeServices = await coreServiceProvider.launch(1, { enableDatawallet: true });
    coreServices = runtimeServices[0].core;
}, 30000);
afterAll(async () => await coreServiceProvider.stop());

describe("Sync", () => {
    test("should return the same promise when calling syncEverything twice without awaiting", async () => {
        const [syncResult1, syncResult2] = await Promise.all([coreServices.account.syncEverything(), coreServices.account.syncEverything()]);

        // The sync results should have the same reference (CAUTION: expect(...).toStrictEqual(...) is not sufficient)
        expect(syncResult1).toBe(syncResult2);
    });

    test("should query the syncRun", async () => {
        const syncRunResponse = await coreServices.account.getSyncInfo();
        expectSuccess(syncRunResponse);

        const syncRun = syncRunResponse.value;
        const dateTime = DateTime.fromISO(syncRun.lastSyncRun!.completedAt);
        expect(dateTime.isValid).toBeTruthy();
    });
});

describe("Automatic Datawallet Sync", () => {
    async function getSyncInfo() {
        const sync = await coreServices.account.getSyncInfo();
        expectSuccess(sync);
        return sync.value;
    }

    test("should run an automatic datawallet sync", async () => {
        await coreServices.account.syncDatawallet();
        const oldSyncTime = await getSyncInfo();

        await uploadFile(coreServices);
        const newSyncTime = await getSyncInfo();

        expect(oldSyncTime).not.toStrictEqual(newSyncTime);
    });

    test("should not run an automatic datawallet sync", async () => {
        const disableResult = await coreServices.account.disableAutoSync();
        expectSuccess(disableResult);

        await coreServices.account.syncDatawallet();
        const oldSyncTime = await getSyncInfo();

        await uploadFile(coreServices);
        expect(await getSyncInfo()).toStrictEqual(oldSyncTime);

        const enableResult = await coreServices.account.enableAutoSync();
        expectSuccess(enableResult);

        expect(await getSyncInfo()).not.toStrictEqual(oldSyncTime);
    });
});

describe("IdentityInfo", () => {
    test("should get the IndentityInformation", async () => {
        const identityInfoResult = await coreServices.account.getIdentityInfo();
        expectSuccess(identityInfoResult);

        const identityInfo = identityInfoResult.value;
        expect(identityInfo.address.length).toBeLessThanOrEqual(36);
        expect(identityInfo.address.length).toBeGreaterThanOrEqual(35);
        expect(identityInfo.address).toMatch(/^id1/);
        expect(identityInfo.publicKey).toHaveLength(43);
    });
});
