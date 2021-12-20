import { ConsumptionServices, DataViewExpander, TransportServices } from "../../src";
import { establishRelationshipWithBodys, getRelationship, RuntimeServiceProvider, syncUntilHasMessages, uploadFile } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let consumptionServices1: ConsumptionServices;
let consumptionServices2: ConsumptionServices;
let transportServices1: TransportServices;
let transportServices2: TransportServices;
let expander1: DataViewExpander;
let expander2: DataViewExpander;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2);
    transportServices1 = runtimeServices[0].transport;
    transportServices2 = runtimeServices[1].transport;
    consumptionServices1 = runtimeServices[0].consumption;
    consumptionServices2 = runtimeServices[1].consumption;
    expander1 = runtimeServices[0].expander;
    expander2 = runtimeServices[1].expander;
    await establishRelationshipWithBodys(
        transportServices1,
        transportServices2,
        {
            "@type": "RelationshipTemplateBody",
            sharedAttributes: [{ "@type": "Attribute", name: "Thing.name", value: "Jürgen" }]
        },
        {
            "@type": "RelationshipCreationChangeRequestBody",
            sharedAttributes: [{ "@type": "Attribute", name: "Thing.name", value: "Barbara" }]
        }
    );
}, 30000);

afterAll(() => serviceProvider.stop());

describe("MessageDVO", () => {
    let transportService2Address: string;
    let fileId: string;
    let messageId: string;
    let mailId: string;
    let changeAttributeMailId: string;

    beforeAll(async () => {
        const file = await uploadFile(transportServices1);
        fileId = file.id;

        const relationship = await getRelationship(transportServices1);
        transportService2Address = relationship.peer;

        const result = await transportServices1.messages.sendMessage({
            recipients: [transportService2Address],
            content: {
                arbitraryValue: true
            },
            attachments: [fileId]
        });
        messageId = result.value.id;
        const mailResult = await transportServices1.messages.sendMessage({
            recipients: [transportService2Address],
            content: {
                "@type": "Mail",
                body: "This is a Mail.",
                cc: [],
                subject: "Mail Subject",
                to: [transportService2Address]
            },
            attachments: [fileId]
        });
        mailId = mailResult.value.id;

        const changeAttributeMailResult = await transportServices1.messages.sendMessage({
            recipients: [transportService2Address],
            content: {
                "@type": "RequestMail",
                body: "This is a RequestMail.",
                cc: [],
                requests: [
                    {
                        "@type": "AttributesChangeRequest",
                        attributes: [
                            {
                                name: "aName",
                                value: "aValue"
                            }
                        ],
                        key: "changeRequest"
                    }
                ],
                subject: "RequestMail Subject",
                to: [transportService2Address]
            },
            attachments: [fileId]
        });
        changeAttributeMailId = changeAttributeMailResult.value.id;

        await syncUntilHasMessages(transportServices2, 3);
    });

    test("check the message dvo for the sender", async () => {
        const dto = (await transportServices1.messages.getMessage({ id: messageId })).value;
        const dvo = await expander1.expandMessageDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(messageId);
        expect(dvo.name).toBe("i18n://dvo.message.name");
        expect(dvo.description).toBeUndefined();
        expect(dvo.type).toBe("MessageDVO");
        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdBy).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.message.id).toStrictEqual(dto.id);
        expect(dvo.message.isOwn).toBe(true);
        expect(dvo.message.createdByObject.type).toBe("IdentityDVO");
        expect(dvo.message.createdByObject.id).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByObject.name).toBe("i18n://dvo.identities.self.name");
        expect(dvo.message.createdByObject.isSelf).toBe(true);
        const recipient = dvo.message.recipientObjects[0];
        expect(recipient.type).toBe("IdentityDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("Barbara");
        expect(recipient.isSelf).toBe(false);
    });

    test("check the message dvo for the recipient", async () => {
        const dto = (await transportServices2.messages.getMessage({ id: messageId })).value;
        const dvo = await expander2.expandMessageDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(messageId);
        expect(dvo.name).toBe("i18n://dvo.message.name");
        expect(dvo.description).toBeUndefined();
        expect(dvo.type).toBe("MessageDVO");
        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdBy).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.message.id).toStrictEqual(dto.id);
        expect(dvo.message.isOwn).toBe(false);
        expect(dvo.message.createdByObject.type).toBe("IdentityDVO");
        expect(dvo.message.createdByObject.id).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByObject.name).toBe("Jürgen");
        expect(dvo.message.createdByObject.isSelf).toBe(false);
        const recipient = dvo.message.recipientObjects[0];
        expect(recipient.type).toBe("IdentityDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("i18n://dvo.identities.self.name");
        expect(recipient.isSelf).toBe(true);
    });

    test("check the mail dvo for the sender", async () => {
        const dto = (await transportServices1.messages.getMessage({ id: mailId })).value;
        const dvo = await expander1.expandMessageDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(mailId);
        expect(dvo.name).toBe("Mail Subject");
        expect(dvo.description).toBeUndefined();
        expect(dvo.type).toBe("MailDVO");
        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdBy).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.message.id).toStrictEqual(dto.id);
        expect(dvo.message.isOwn).toBe(true);
        expect(dvo.message.createdByObject.type).toBe("IdentityDVO");
        expect(dvo.message.createdByObject.id).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByObject.name).toBe("i18n://dvo.identities.self.name");
        expect(dvo.message.createdByObject.isSelf).toBe(true);
        const recipient = dvo.message.recipientObjects[0];
        expect(recipient.type).toBe("IdentityDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("Barbara");
        expect(recipient.isSelf).toBe(false);
    });

    test("check the mail dvo for the recipient", async () => {
        const dto = (await transportServices2.messages.getMessage({ id: mailId })).value;
        const dvo = await expander2.expandMessageDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(mailId);
        expect(dvo.name).toBe("Mail Subject");
        expect(dvo.description).toBeUndefined();
        expect(dvo.type).toBe("MailDVO");
        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdBy).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.message.id).toStrictEqual(dto.id);
        expect(dvo.message.isOwn).toBe(false);
        expect(dvo.message.createdByObject.type).toBe("IdentityDVO");
        expect(dvo.message.createdByObject.id).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByObject.name).toBe("Jürgen");
        expect(dvo.message.createdByObject.isSelf).toBe(false);
        const recipient = dvo.message.recipientObjects[0];
        expect(recipient.type).toBe("IdentityDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("i18n://dvo.identities.self.name");
        expect(recipient.isSelf).toBe(true);
    });

    test("check the requestmail dvo for the sender", async () => {
        const dto = (await transportServices1.messages.getMessage({ id: changeAttributeMailId })).value;
        const dvo = await expander1.expandMessageDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(changeAttributeMailId);
        expect(dvo.name).toBe("RequestMail Subject");
        expect(dvo.description).toBeUndefined();
        expect(dvo.type).toBe("RequestMailDVO");
        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdBy).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.message.id).toStrictEqual(dto.id);
        expect(dvo.message.isOwn).toBe(true);
        expect(dvo.message.createdByObject.type).toBe("IdentityDVO");
        expect(dvo.message.createdByObject.id).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByObject.name).toBe("i18n://dvo.identities.self.name");
        expect(dvo.message.createdByObject.isSelf).toBe(true);
        const recipient = dvo.message.recipientObjects[0];
        expect(recipient.type).toBe("IdentityDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("Barbara");
        expect(recipient.isSelf).toBe(false);
    });

    test("check the requestmail dvo for the recipient", async () => {
        const dto = (await transportServices2.messages.getMessage({ id: changeAttributeMailId })).value;
        const dvo = await expander2.expandMessageDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(changeAttributeMailId);
        expect(dvo.name).toBe("RequestMail Subject");
        expect(dvo.description).toBeUndefined();
        expect(dvo.type).toBe("RequestMailDVO");
        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.message.createdBy).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.message.id).toStrictEqual(dto.id);
        expect(dvo.message.isOwn).toBe(false);
        expect(dvo.message.createdByObject.type).toBe("IdentityDVO");
        expect(dvo.message.createdByObject.id).toStrictEqual(dto.createdBy);
        expect(dvo.message.createdByObject.name).toBe("Jürgen");
        expect(dvo.message.createdByObject.isSelf).toBe(false);
        const recipient = dvo.message.recipientObjects[0];
        expect(recipient.type).toBe("IdentityDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("i18n://dvo.identities.self.name");
        expect(recipient.isSelf).toBe(true);
    });
});
