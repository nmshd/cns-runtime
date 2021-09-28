import { ConsumptionIds } from "@nmshd/consumption";
import { CoreDate, CoreId, TransportIds } from "@nmshd/transport";
import { ConsumptionServices } from "../../src";
import { expectSuccess, QueryParamConditions, RuntimeServiceProvider } from "../lib";

const runtimeServiceProvider = new RuntimeServiceProvider();
let consumptionServices: ConsumptionServices;

beforeAll(async () => {
    const runtimeServices = await runtimeServiceProvider.launch(1);
    consumptionServices = runtimeServices[0].consumption;
}, 30000);
afterAll(async () => await runtimeServiceProvider.stop());

describe("SharedItems", () => {
    const content = { aKey: "a-Value" };
    const address = "a-35-character-long-string-aaaaaaaa";
    let reference: string;
    let sharedItemId: string;

    test("should create a shared item", async () => {
        reference = (await CoreId.generate()).toString();
        const result = await consumptionServices.sharedItems.createSharedItem({
            sharedBy: address,
            sharedWith: address,
            content: content,
            sharedAt: CoreDate.utc().toISOString(),
            reference: reference
        });
        expectSuccess(result);

        const sharedItem = result.value;
        sharedItemId = sharedItem.id;
    });

    test("should request the shared item", async () => {
        const result = await consumptionServices.sharedItems.getSharedItem({ id: sharedItemId });
        expectSuccess(result);

        const sharedItem = result.value;

        expect(sharedItem.id).toStrictEqual(sharedItemId);
        expect(sharedItem.content).toStrictEqual(content);
    });

    test("should get the shared items in the list", async () => {
        const result = await consumptionServices.sharedItems.getSharedItems({});
        expectSuccess(result);

        const sharedItems = result.value;
        expect(sharedItems).toHaveLength(1);

        expect(sharedItems[0].id).toStrictEqual(sharedItemId);
    });

    test("should get the shared item by address", async () => {
        const result = await consumptionServices.sharedItems.getSharedItemsByAddress({ address: address });
        expectSuccess(result);

        const sharedItems = result.value;
        expect(sharedItems).toHaveLength(1);

        expect(sharedItems[0].id).toStrictEqual(sharedItemId);
    });

    test("should get shared the shared item by sharedBy address", async () => {
        const result = await consumptionServices.sharedItems.getSharedItemsSharedByAddress({ address: address });
        expectSuccess(result);

        const sharedItems = result.value;
        expect(sharedItems).toHaveLength(1);

        expect(sharedItems[0].id).toStrictEqual(sharedItemId);
    });

    test("should get shared the shared item by sharedWith address", async () => {
        const result = await consumptionServices.sharedItems.getSharedItemsSharedWithAddress({ address: address });
        expectSuccess(result);

        const sharedItems = result.value;
        expect(sharedItems).toHaveLength(1);

        expect(sharedItems[0].id).toStrictEqual(sharedItemId);
    });

    test("should get the shared item by reference", async () => {
        const result = await consumptionServices.sharedItems.getSharedItemsByReference({ reference: reference });
        expectSuccess(result);

        const sharedItems = result.value;
        expect(sharedItems).toHaveLength(1);

        expect(sharedItems[0].id).toStrictEqual(sharedItemId);
    });

    test("should update the shared item", async () => {
        const newContent = { aKey: "another-value" };
        const updateResult = await consumptionServices.sharedItems.updateSharedItem({
            id: sharedItemId,
            content: newContent
        });
        expectSuccess(updateResult);

        const result = await consumptionServices.sharedItems.getSharedItem({ id: sharedItemId });
        expectSuccess(result);
        const sharedItem = result.value;
        expect(sharedItem.content).toStrictEqual(newContent);
    });

    test("should delete the shared item", async () => {
        const deleteResult = await consumptionServices.sharedItems.deleteSharedItem({ id: sharedItemId });
        expectSuccess(deleteResult);

        const result = await consumptionServices.sharedItems.getSharedItems({});
        expectSuccess(result);

        const sharedItems = result.value;
        expect(sharedItems).toHaveLength(0);
    });
});

describe("SharedItems query", () => {
    test("sharedItems can be queried by their attributes", async () => {
        const address = "a-35-character-long-string-aaaaaaaa";
        const date = CoreDate.utc().toISOString();

        const result = await consumptionServices.sharedItems.createSharedItem({
            sharedBy: address,
            sharedWith: address,
            content: {},
            sharedAt: date,
            reference: (await TransportIds.generic.generate()).toString(),
            succeedsAt: date,
            tags: ["a-tag"],
            succeedsItem: (await ConsumptionIds.sharedItem.generate()).toString(),
            expiresAt: date
        });
        expectSuccess(result);

        const sharedItem = result.value;

        const conditions = new QueryParamConditions<ConsumptionServices>(sharedItem, consumptionServices)
            .addStringArraySet("tags")
            .addStringSet("sharedBy")
            .addStringSet("sharedWith")
            .addDateSet("sharedAt")
            .addStringSet("reference")
            .addStringSet("succeedsItem")
            .addDateSet("succeedsAt")
            .addDateSet("expiresAt");

        await conditions.executeTests((c, q) => c.sharedItems.getSharedItems({ query: q }));
    });
});
