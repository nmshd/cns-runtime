import { CoreServices } from "../../src";
import {
    establishRelationship,
    exchangeMessage,
    expectError,
    expectSuccess,
    getRelationship,
    QueryParamConditions,
    RuntimeServiceProvider,
    syncUntilHasMessages,
    uploadFile
} from "../lib";

const coreServiceProvider = new RuntimeServiceProvider();
let coreServices1: CoreServices;
let coreServices2: CoreServices;

beforeAll(async () => {
    const runtimeServices = await coreServiceProvider.launch(2);
    coreServices1 = runtimeServices[0].core;
    coreServices2 = runtimeServices[1].core;
    await establishRelationship(coreServices1, coreServices2);
}, 30000);

afterAll(() => coreServiceProvider.stop());

describe("Messaging", () => {
    let coreService2Address: string;
    let fileId: string;
    let messageId: string;

    beforeAll(async () => {
        const file = await uploadFile(coreServices1);
        fileId = file.id;

        const relationship = await getRelationship(coreServices1);
        coreService2Address = relationship.peer;
    });

    test("send a Message from CoreService1 to CoreService2", async () => {
        expect(coreService2Address).toBeDefined();
        expect(fileId).toBeDefined();

        const response = await coreServices1.messages.sendMessage({
            recipients: [coreService2Address],
            content: {
                "@type": "Mail",
                body: "b",
                cc: [],
                subject: "a",
                to: [coreService2Address]
            },
            attachments: [fileId]
        });
        expectSuccess(response);

        messageId = response.value.id;
    });

    test("receive the message in a sync run", async () => {
        expect(messageId).toBeDefined();

        const messages = await syncUntilHasMessages(coreServices2);
        expect(messages).toHaveLength(1);

        const message = messages[0];
        expect(message.id).toStrictEqual(messageId);
        expect(message.content).toStrictEqual({
            "@type": "Mail",
            body: "b",
            cc: [],
            subject: "a",
            to: [coreService2Address]
        });
    });

    test("receive the message on CoreService2 in /Messages", async () => {
        expect(messageId).toBeDefined();

        const response = await coreServices2.messages.getMessages({});
        expectSuccess(response);
        expect(response.value).toHaveLength(1);

        const message = response.value[0];
        expect(message.id).toStrictEqual(messageId);
        expect(message.content).toStrictEqual({
            "@type": "Mail",
            body: "b",
            cc: [],
            subject: "a",
            to: [coreService2Address]
        });
    });

    test("receive the message on CoreService2 in /Messages/{id}", async () => {
        expect(messageId).toBeDefined();

        const response = await coreServices2.messages.getMessage({ id: messageId });
        expectSuccess(response);
    });
});

describe("Message errors", () => {
    const fakeAddress = "id1PNvUP4jHD74qo6usnWNoaFGFf33MXZi6c";
    test("should throw correct error for empty 'to' in the Message", async () => {
        const result = await coreServices1.messages.sendMessage({
            recipients: [fakeAddress],
            content: {
                "@type": "Mail",
                to: [],
                subject: "A Subject",
                body: "A Body"
            }
        });
        expectError(result, "Mail.to:Array :: may not be empty", "error.runtime.requestDeserialization");
    });

    test("should throw correct error for missing 'to' in the Message", async () => {
        const result = await coreServices1.messages.sendMessage({
            recipients: [fakeAddress],
            content: {
                "@type": "Mail",
                subject: "A Subject",
                body: "A Body"
            }
        });
        expectError(result, "Mail.to :: Value is not defined", "error.runtime.requestDeserialization");
    });
});

describe("Message query", () => {
    test("query messages", async () => {
        const message = await exchangeMessage(coreServices1, coreServices2);
        const conditions = new QueryParamConditions(message, coreServices1)
            .addDateSet("createdAt")
            .addDateSet("lastMessageSentAt")
            .addStringSet("createdBy")
            .addStringSet("recipients.address", message.recipients[0].address)
            .addStringSet("content.@type")
            .addStringSet("content.subject")
            .addStringSet("content.body")
            .addStringSet("createdByDevice")
            .addStringArraySet("attachments")
            .addStringArraySet("relationshipIds")
            .addSingleCondition({
                key: "participant",
                value: [message.createdBy, "id111111111111111111111111111111111"],
                expectedResult: true
            });

        await conditions.executeTests((c, q) => c.messages.getMessages({ query: q }));
    });
});
