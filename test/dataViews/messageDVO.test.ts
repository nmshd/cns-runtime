import { MailJSON, RequestMailJSON } from "@nmshd/content";
import { AttributesChangeRequestDVO, ConsumptionServices, DataViewExpander, MailDVO, RequestMailDVO, TransportServices } from "../../src";
import { establishRelationshipWithBodys, getRelationship, RuntimeServiceProvider, syncUntilHasMessages, uploadFile } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let transportServices2: TransportServices;
let consumptionServices2: ConsumptionServices;
let expander1: DataViewExpander;
let expander2: DataViewExpander;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2);
    transportServices1 = runtimeServices[0].transport;
    transportServices2 = runtimeServices[1].transport;
    expander1 = runtimeServices[0].expander;
    expander2 = runtimeServices[1].expander;
    consumptionServices2 = runtimeServices[1].consumption;
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
                                name: "Thing.name",
                                value: "Sandra"
                            },
                            {
                                name: "Person.givenName",
                                value: "Sandra"
                            }
                        ],
                        key: "changeRequest"
                    },
                    {
                        "@type": "AttributesChangeRequest",
                        attributes: [
                            {
                                name: "aName",
                                value: "aValue"
                            }
                        ],
                        key: "changeRequest2"
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
        expect(dvo.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.id).toStrictEqual(dto.id);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.createdBy.type).toBe("IdentityDVO");
        expect(dvo.createdBy.id).toStrictEqual(dto.createdBy);
        expect(dvo.createdBy.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.createdBy.isSelf).toBe(true);
        const recipient = dvo.recipients[0];
        expect(recipient.type).toBe("RecipientDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("Barbara");
        expect(recipient.isSelf).toBe(false);
        expect(dvo.status).toBe("Delivering");
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
        expect(dvo.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.id).toStrictEqual(dto.id);
        expect(dvo.isOwn).toBe(false);
        expect(dvo.createdBy.type).toBe("IdentityDVO");
        expect(dvo.createdBy.id).toStrictEqual(dto.createdBy);
        expect(dvo.createdBy.name).toBe("Jürgen");
        expect(dvo.createdBy.isSelf).toBe(false);
        const recipient = dvo.recipients[0];
        expect(recipient.type).toBe("RecipientDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("i18n://dvo.identity.self.name");
        expect(recipient.isSelf).toBe(true);
        expect(dvo.status).toBe("Received");
    });

    test("check the mail dvo for the sender", async () => {
        const dto = (await transportServices1.messages.getMessage({ id: mailId })).value;
        const dvo = (await expander1.expandMessageDTO(dto)) as MailDVO;
        expect(dto.content["@type"]).toBe("Mail");
        const mail = dto.content as MailJSON;
        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(mailId);
        expect(dvo.name).toBe("Mail Subject");
        expect(dvo.description).toBeUndefined();
        expect(dvo.type).toBe("MailDVO");
        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.id).toStrictEqual(dto.id);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.createdBy.type).toBe("IdentityDVO");
        expect(dvo.createdBy.id).toStrictEqual(dto.createdBy);
        expect(dvo.createdBy.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.createdBy.description).toBe("i18n://dvo.identity.self.description");
        expect(dvo.createdBy.initials).toBe("i18n://dvo.identity.self.initials");
        expect(dvo.createdBy.isSelf).toBe(true);

        expect(dvo.recipients).toHaveLength(1);
        const recipient = dvo.recipients[0];
        expect(recipient.type).toBe("RecipientDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("Barbara");
        expect(recipient.isSelf).toBe(false);

        expect(dvo.to).toHaveLength(1);
        const to = dvo.to[0];
        expect(to.type).toBe("RecipientDVO");
        expect(to.id).toStrictEqual(mail.to[0]);
        expect(to.name).toBe("Barbara");
        expect(to.isSelf).toBe(false);
        expect(dvo.toCount).toStrictEqual(mail.to.length);
        expect(dvo.ccCount).toStrictEqual(mail.cc!.length);
        expect(dvo.subject).toStrictEqual(mail.subject);
        expect(dvo.body).toStrictEqual(mail.body);
    });

    test("check the mail dvo for the recipient", async () => {
        const dto = (await transportServices2.messages.getMessage({ id: mailId })).value;
        const dvo = (await expander2.expandMessageDTO(dto)) as MailDVO;
        expect(dto.content["@type"]).toBe("Mail");
        const mail = dto.content as MailJSON;
        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(mailId);
        expect(dvo.name).toBe("Mail Subject");
        expect(dvo.description).toBeUndefined();
        expect(dvo.type).toBe("MailDVO");
        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.id).toStrictEqual(dto.id);
        expect(dvo.isOwn).toBe(false);
        expect(dvo.createdBy.type).toBe("IdentityDVO");
        expect(dvo.createdBy.id).toStrictEqual(dto.createdBy);
        expect(dvo.createdBy.name).toBe("Jürgen");
        expect(dvo.createdBy.isSelf).toBe(false);
        const recipient = dvo.recipients[0];
        expect(recipient.type).toBe("RecipientDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("i18n://dvo.identity.self.name");
        expect(recipient.description).toBe("i18n://dvo.identity.self.description");
        expect(recipient.initials).toBe("i18n://dvo.identity.self.initials");
        expect(recipient.isSelf).toBe(true);

        expect(dvo.to).toHaveLength(1);
        const to = dvo.to[0];
        expect(to.type).toBe("RecipientDVO");
        expect(to.id).toStrictEqual(mail.to[0]);
        expect(to.name).toBe("i18n://dvo.identity.self.name");
        expect(to.isSelf).toBe(true);
        expect(dvo.toCount).toStrictEqual(mail.to.length);
        expect(dvo.ccCount).toStrictEqual(mail.cc!.length);
        expect(dvo.subject).toStrictEqual(mail.subject);
        expect(dvo.body).toStrictEqual(mail.body);
    });

    test("check the requestmail dvo for the sender", async () => {
        const dto = (await transportServices1.messages.getMessage({ id: changeAttributeMailId })).value;
        const dvo = (await expander1.expandMessageDTO(dto)) as RequestMailDVO;
        expect(dto.content["@type"]).toBe("RequestMail");
        const requestMail = dto.content as RequestMailJSON;
        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(changeAttributeMailId);
        expect(dvo.name).toBe("RequestMail Subject");
        expect(dvo.description).toBeUndefined();
        expect(dvo.type).toBe("RequestMailDVO");
        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.id).toStrictEqual(dto.id);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.createdBy.type).toBe("IdentityDVO");
        expect(dvo.createdBy.id).toStrictEqual(dto.createdBy);
        expect(dvo.createdBy.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.createdBy.isSelf).toBe(true);
        const recipient = dvo.recipients[0];
        expect(recipient.type).toBe("RecipientDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("Barbara");
        expect(recipient.isSelf).toBe(false);

        expect(dvo.to).toHaveLength(1);
        const to = dvo.to[0];
        expect(to.type).toBe("RecipientDVO");
        expect(to.id).toStrictEqual(requestMail.to[0]);
        expect(to.name).toBe("Barbara");
        expect(to.isSelf).toBe(false);
        expect(dvo.toCount).toStrictEqual(requestMail.to.length);
        expect(dvo.ccCount).toStrictEqual(requestMail.cc!.length);
        expect(dvo.subject).toStrictEqual(requestMail.subject);
        expect(dvo.body).toStrictEqual(requestMail.body);

        const requests = requestMail.requests;
        expect(dvo.requests).toHaveLength(2);
        expect(dvo.requestCount).toBe(2);

        expect(dvo.requests[0].type).toBe("AttributesChangeRequestDVO");
        const request = dvo.requests[0] as AttributesChangeRequestDVO;

        expect(request.id).toStrictEqual(requests[0].id ? requests[0].id : "");
        expect(request.expiresAt).toStrictEqual(requests[0].expiresAt);
        expect(request.oldAttributes).toHaveLength(2);
        expect(request.newAttributes).toHaveLength(2);
    });

    test("check the requestmail dvo for the recipient", async () => {
        await consumptionServices2.attributes.succeedAttribute({
            attribute: {
                name: "Thing.name",
                value: "Barbara"
            }
        });

        const dto = (await transportServices2.messages.getMessage({ id: changeAttributeMailId })).value;
        const dvo = (await expander2.expandMessageDTO(dto)) as RequestMailDVO;
        expect(dto.content["@type"]).toBe("RequestMail");
        const requestMail = dto.content as RequestMailJSON;

        expect(dvo).toBeDefined();
        expect(dvo.id).toStrictEqual(changeAttributeMailId);
        expect(dvo.name).toBe("RequestMail Subject");
        expect(dvo.description).toBeUndefined();
        expect(dvo.type).toBe("RequestMailDVO");
        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.createdAt).toStrictEqual(dto.createdAt);
        expect(dvo.createdByDevice).toStrictEqual(dto.createdByDevice);
        expect(dvo.id).toStrictEqual(dto.id);
        expect(dvo.isOwn).toBe(false);
        expect(dvo.createdBy.type).toBe("IdentityDVO");
        expect(dvo.createdBy.id).toStrictEqual(dto.createdBy);
        expect(dvo.createdBy.name).toBe("Jürgen");
        expect(dvo.createdBy.isSelf).toBe(false);
        const recipient = dvo.recipients[0];
        expect(recipient.type).toBe("RecipientDVO");
        expect(recipient.id).toStrictEqual(dto.recipients[0].address);
        expect(recipient.name).toBe("i18n://dvo.identity.self.name");
        expect(recipient.isSelf).toBe(true);

        expect(dvo.to).toHaveLength(1);
        const to = dvo.to[0];
        expect(to.type).toBe("RecipientDVO");
        expect(to.id).toStrictEqual(requestMail.to[0]);
        expect(to.name).toBe("i18n://dvo.identity.self.name");
        expect(to.isSelf).toBe(true);
        expect(dvo.toCount).toStrictEqual(requestMail.to.length);
        expect(dvo.ccCount).toStrictEqual(requestMail.cc!.length);
        expect(dvo.subject).toStrictEqual(requestMail.subject);
        expect(dvo.body).toStrictEqual(requestMail.body);

        const requests = requestMail.requests;
        expect(dvo.requests).toHaveLength(2);
        expect(dvo.requestCount).toBe(2);

        expect(dvo.requests[0].type).toBe("AttributesChangeRequestDVO");
        let request = dvo.requests[0] as AttributesChangeRequestDVO;

        expect(request.id).toStrictEqual(requests[0].id ? requests[0].id : "");
        expect(request.expiresAt).toStrictEqual(requests[0].expiresAt);
        expect(request.oldAttributes).toHaveLength(2);
        expect(request.newAttributes).toHaveLength(2);

        const oldAttributeThing = request.oldAttributes[0];
        expect(oldAttributeThing.type).toBe("MatchedAttributesDVO");
        expect(oldAttributeThing.bestMatch).toBeDefined();
        expect(oldAttributeThing.matches).toHaveLength(1);
        expect(oldAttributeThing.bestMatch!.type).toBe("StoredAttributeDVO");
        expect(oldAttributeThing.bestMatch!.isOwn).toBe(true);
        expect(oldAttributeThing.bestMatch!.name).toBe("Thing.name");
        expect(oldAttributeThing.bestMatch!.value).toBe("Barbara");
        expect(oldAttributeThing.bestMatch!.sharedItems).toHaveLength(0);

        const newAttributeThing = request.newAttributes[0];
        expect(newAttributeThing.type).toBe("AttributeDVO");
        expect(newAttributeThing.isOwn).toBe(false);
        expect(newAttributeThing.name).toBe("Thing.name");
        expect(newAttributeThing.value).toBe("Sandra");

        const oldAttributePerson = request.oldAttributes[1];
        expect(oldAttributePerson.type).toBe("MatchedAttributesDVO");
        expect(oldAttributePerson.bestMatch).toBeUndefined();
        expect(oldAttributePerson.matches).toHaveLength(0);

        const newAttributePerson = request.newAttributes[1];
        expect(newAttributePerson.type).toBe("AttributeDVO");
        expect(newAttributePerson.isOwn).toBe(false);
        expect(newAttributePerson.name).toBe("Person.givenName");
        expect(newAttributePerson.value).toBe("Sandra");

        request = dvo.requests[1] as AttributesChangeRequestDVO;

        const oldAttributeAName = request.oldAttributes[0];
        expect(oldAttributeAName.type).toBe("MatchedAttributesDVO");
        expect(oldAttributeAName.bestMatch).toBeUndefined();
        expect(oldAttributeAName.matches).toHaveLength(0);

        const newAttributeAName = request.newAttributes[0];
        expect(newAttributeAName.type).toBe("AttributeDVO");
        expect(newAttributeAName.isOwn).toBe(false);
        expect(newAttributeAName.name).toBe("aName");
        expect(newAttributeAName.value).toBe("aValue");
    });
});
