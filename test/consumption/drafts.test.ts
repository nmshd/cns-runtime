import { ConsumptionServices } from "../../src";
import { expectSuccess, QueryParamConditions, RuntimeServiceProvider } from "../lib";

const runtimeServiceProvider = new RuntimeServiceProvider();
let consumptionServices: ConsumptionServices;

beforeAll(async () => {
    const runtimeServices = await runtimeServiceProvider.launch(1);
    consumptionServices = runtimeServices[0].consumption;
}, 30000);
afterAll(async () => await runtimeServiceProvider.stop());

describe("Drafts", () => {
    const content = { aKey: "a-Value" };
    let draftId: string;

    test("should create a draft", async () => {
        const result = await consumptionServices.drafts.createDraft({ content: content, type: "test" });

        expectSuccess(result);

        const draft = result.value;
        draftId = draft.id;
    });

    test("should get the draft", async () => {
        const result = await consumptionServices.drafts.getDraft({ id: draftId });
        expectSuccess(result);

        const draft = result.value;
        expect(draft.content).toStrictEqual(content);
    });

    test("should have query the draft", async () => {
        const result = await consumptionServices.drafts.getDrafts({});
        expectSuccess(result);

        const drafts = result.value;
        expect(drafts).toHaveLength(1);

        expect(drafts[0].id).toStrictEqual(draftId);
    });

    test("should edit the draft", async () => {
        const newContent = { aKey: "another-Value" };
        const updateResult = await consumptionServices.drafts.updateDraft({ id: draftId, content: newContent });
        expectSuccess(updateResult);

        const result = await consumptionServices.drafts.getDraft({ id: draftId });
        expectSuccess(result);

        const draft = result.value;
        expect(draft.content).toStrictEqual(newContent);
    });

    test("should delete the draft", async () => {
        const deleteResult = await consumptionServices.drafts.deleteDraft({ id: draftId });
        expectSuccess(deleteResult);

        const result = await consumptionServices.drafts.getDrafts({});
        expectSuccess(result);

        const drafts = result.value;
        expect(drafts).toHaveLength(0);
    });
});

describe("Drafts query", () => {
    test("drafts can be queried by their attributes", async () => {
        const result = await consumptionServices.drafts.createDraft({ content: {}, type: "test" });

        expectSuccess(result);

        const draft = result.value;

        const conditions = new QueryParamConditions<ConsumptionServices>(draft, consumptionServices).addStringSet("type").addDateSet("createdAt").addDateSet("lastModifiedAt");

        await conditions.executeTests((c, q) => c.drafts.getDrafts({ query: q }));
    });
});
