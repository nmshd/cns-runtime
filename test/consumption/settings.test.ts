import { ConsumptionIds } from "@nmshd/consumption";
import { CoreDate, TransportIds } from "@nmshd/transport";
import { ConsumptionServices, GetSettingsQuery } from "../../src";
import { QueryParamConditions, RuntimeServiceProvider } from "../lib";

const runtimeServiceProvider = new RuntimeServiceProvider();
let consumptionServices: ConsumptionServices;

beforeAll(async () => {
    const runtimeServices = await runtimeServiceProvider.launch(1);
    consumptionServices = runtimeServices[0].consumption;
}, 30000);
afterAll(async () => await runtimeServiceProvider.stop());

describe("Settings", () => {
    const value = { aKey: "a-value" };
    let settingId: string;

    test("should create a setting", async () => {
        const result = await consumptionServices.settings.createSetting({
            key: "a-key",
            value: value
        });
        expect(result).toBeSuccessful();

        const setting = result.value;
        settingId = setting.id;
    });

    test("should get the setting", async () => {
        const result = await consumptionServices.settings.getSetting({ id: settingId });
        expect(result).toBeSuccessful();

        const setting = result.value;
        settingId = setting.id;

        expect(setting.value).toStrictEqual(value);
    });

    test("should contain the setting in the list of settings", async () => {
        const result = await consumptionServices.settings.getSettings({});
        expect(result).toBeSuccessful();

        const settings = result.value;

        expect(settings).toHaveLength(1);
        expect(settings[0].id).toStrictEqual(settingId);
        expect(settings[0].value).toStrictEqual(value);
    });

    test("should edit the setting", async () => {
        const newValue = { aKey: "another-Value" };
        const updateResult = await consumptionServices.settings.updateSetting({
            id: settingId,
            value: newValue
        });
        expect(updateResult).toBeSuccessful();

        const result = await consumptionServices.settings.getSetting({ id: settingId });
        expect(result).toBeSuccessful();

        const setting = result.value;
        expect(setting.value).toStrictEqual(newValue);
    });

    test("should delete the setting", async () => {
        const deleteResult = await consumptionServices.settings.deleteSetting({ id: settingId });
        expect(deleteResult).toBeSuccessful();

        const result = await consumptionServices.settings.getSettings({});
        expect(result).toBeSuccessful();

        const settings = result.value;
        expect(settings).toHaveLength(0);
    });
});

describe("Settings query", () => {
    test("settings can be queried by their attributes", async () => {
        const result = await consumptionServices.settings.createSetting({
            key: "a-key",
            value: {},

            reference: (await TransportIds.generic.generate()).toString(),
            scope: "Device",
            succeedsItem: (await ConsumptionIds.setting.generate()).toString(),
            succeedsAt: CoreDate.utc().toString()
        });
        expect(result).toBeSuccessful();

        const setting = result.value;

        const conditions = new QueryParamConditions<GetSettingsQuery, ConsumptionServices>(setting, consumptionServices)
            .addStringSet("key")
            .addStringSet("scope")
            .addStringSet("reference")
            .addDateSet("createdAt")
            .addStringSet("succeedsItem")
            .addDateSet("succeedsAt");

        await conditions.executeTests((c, q) => c.settings.getSettings({ query: q }));
    });
});
