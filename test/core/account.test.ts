import { DateTime } from "luxon";
import { TransportServices } from "../../src";
import { RuntimeServiceProvider, uploadFile } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices: TransportServices;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(1, { enableDatawallet: true });
    transportServices = runtimeServices[0].transport;
}, 30000);
afterAll(async () => await serviceProvider.stop());

describe("Sync", () => {
    test("should return the same promise when calling syncEverything twice without awaiting", async () => {
        const [syncResult1, syncResult2] = await Promise.all([transportServices.account.syncEverything(), transportServices.account.syncEverything()]);

        // The sync results should have the same reference (CAUTION: expect(...).toStrictEqual(...) is not sufficient)
        expect(syncResult1).toBe(syncResult2);
    });

    test("should query the syncRun", async () => {
        const syncRunResponse = await transportServices.account.getSyncInfo();
        expect(syncRunResponse).toBeSuccessful();

        const syncRun = syncRunResponse.value;
        const dateTime = DateTime.fromISO(syncRun.lastSyncRun!.completedAt);
        expect(dateTime.isValid).toBeTruthy();
    });
});

describe("Automatic Datawallet Sync", () => {
    async function getSyncInfo() {
        const sync = await transportServices.account.getSyncInfo();
        expect(sync).toBeSuccessful();
        return sync.value;
    }

    test("should run an automatic datawallet sync", async () => {
        await transportServices.account.syncDatawallet();
        const oldSyncTime = await getSyncInfo();

        await uploadFile(transportServices);
        const newSyncTime = await getSyncInfo();

        expect(oldSyncTime).not.toStrictEqual(newSyncTime);
    });

    test("should not run an automatic datawallet sync", async () => {
        const disableResult = await transportServices.account.disableAutoSync();
        expect(disableResult).toBeSuccessful();

        await transportServices.account.syncDatawallet();
        const oldSyncTime = await getSyncInfo();

        await uploadFile(transportServices);
        expect(await getSyncInfo()).toStrictEqual(oldSyncTime);

        const enableResult = await transportServices.account.enableAutoSync();
        expect(enableResult).toBeSuccessful();

        expect(await getSyncInfo()).not.toStrictEqual(oldSyncTime);
    });
});

describe("IdentityInfo", () => {
    test("should get the IndentityInformation", async () => {
        const identityInfoResult = await transportServices.account.getIdentityInfo();
        expect(identityInfoResult).toBeSuccessful();

        const identityInfo = identityInfoResult.value;
        expect(identityInfo.address.length).toBeLessThanOrEqual(36);
        expect(identityInfo.address.length).toBeGreaterThanOrEqual(35);
        expect(identityInfo.address).toMatch(/^id1/);
        expect(identityInfo.publicKey).toHaveLength(43);
    });
});
