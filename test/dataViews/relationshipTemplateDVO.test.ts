import { EventBus } from "@js-soft/ts-utils";
import { CreateAttributeRequestItem, GivenName, IdentityAttribute, IdentityAttributeQueryJSON, ProposeAttributeRequestItem, Surname } from "@nmshd/content";
import { CoreAddress } from "@nmshd/transport";
import {
    ConsumptionServices,
    DataViewExpander,
    IncomingRequestStatusChangedEvent,
    LocalAttributeDTO,
    RelationshipTemplateDTO,
    RepositoryAttributeDVO,
    TransportServices
} from "../../src";
import { createTemplate, RuntimeServiceProvider, waitForEvent } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let templatorAddress: string;
let templatorTransport: TransportServices;
let templatorConsumption: ConsumptionServices;
let templatorExpander: DataViewExpander;
let requestorTransport: TransportServices;
let requestorConsumption: ConsumptionServices;
let requestorExpander: DataViewExpander;
let templatorTemplate: RelationshipTemplateDTO;
let requestorTemplate: RelationshipTemplateDTO;
let requestorEventBus: EventBus;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2, { enableRequestModule: true });
    templatorTransport = runtimeServices[0].transport;
    templatorConsumption = runtimeServices[0].consumption;
    templatorExpander = runtimeServices[0].expander;
    templatorAddress = (await templatorTransport.account.getIdentityInfo()).value.address;
    requestorTransport = runtimeServices[1].transport;
    requestorConsumption = runtimeServices[1].consumption;
    requestorExpander = runtimeServices[1].expander;
    requestorEventBus = runtimeServices[1].eventBus;
}, 30000);

afterAll(() => serviceProvider.stop());

describe("RelationshipTemplateDVO", () => {
    const attributes: LocalAttributeDTO[] = [];

    beforeAll(async () => {
        attributes.push(
            (
                await templatorConsumption.attributes.createAttribute({
                    content: IdentityAttribute.from<GivenName>({
                        owner: CoreAddress.from(templatorAddress),
                        value: GivenName.fromAny("Hugo")
                    }).toJSON() as any
                })
            ).value
        );
        attributes.push(
            (
                await templatorConsumption.attributes.createAttribute({
                    content: IdentityAttribute.from<GivenName>({
                        owner: CoreAddress.from(templatorAddress),
                        value: GivenName.fromAny("Egon")
                    }).toJSON() as any
                })
            ).value
        );
        attributes.push(
            (
                await templatorConsumption.attributes.createAttribute({
                    content: IdentityAttribute.from<Surname>({
                        owner: CoreAddress.from(templatorAddress),
                        value: Surname.fromAny("Becker")
                    }).toJSON() as any
                })
            ).value
        );
        const templateBody = {
            "@type": "RelationshipTemplateBody",
            onNewRelationship: {
                "@type": "Request",
                items: [
                    {
                        "@type": "RequestItemGroup",
                        mustBeAccepted: true,
                        title: "Templator Attributes",
                        items: [
                            CreateAttributeRequestItem.from({
                                mustBeAccepted: true,
                                attribute: IdentityAttribute.from({
                                    owner: CoreAddress.from(templatorAddress),
                                    value: GivenName.fromAny({
                                        value: "Theo"
                                    })
                                })
                            }),
                            CreateAttributeRequestItem.from({
                                mustBeAccepted: true,
                                attribute: IdentityAttribute.from({
                                    owner: CoreAddress.from(templatorAddress),
                                    value: Surname.fromAny({
                                        value: "Templator"
                                    })
                                })
                            })
                        ]
                    },
                    {
                        "@type": "RequestItemGroup",
                        mustBeAccepted: true,
                        title: "Proposed Attributes",
                        items: [
                            ProposeAttributeRequestItem.from({
                                mustBeAccepted: true,
                                attribute: IdentityAttribute.from({
                                    owner: CoreAddress.from(templatorAddress),
                                    value: GivenName.fromAny({
                                        value: "Theo"
                                    })
                                })
                            }),
                            CreateAttributeRequestItem.from({
                                mustBeAccepted: true,
                                attribute: IdentityAttribute.from({
                                    owner: CoreAddress.from(templatorAddress),
                                    value: Surname.fromAny({
                                        value: "Templator"
                                    })
                                })
                            })
                        ]
                    }
                ]
            }
        };
        templatorTemplate = await createTemplate(templatorTransport, templateBody);
        const waitForIncomingRequest = waitForEvent(requestorEventBus, IncomingRequestStatusChangedEvent, 50000);
        const templateResult = await requestorTransport.relationshipTemplates.loadPeerRelationshipTemplate({ reference: templatorTemplate.truncatedReference });
        requestorTemplate = templateResult.value;

        await waitForIncomingRequest;
    });

    test("TemplateDVO for templator", async () => {
        const dto = templatorTemplate;
        const dvo = await templatorExpander.expandRelationshipTemplateDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.id);
        expect(dvo.type).toBe("RelationshipTemplateDVO");
    });

    test("TemplateDVO for requestor", async () => {
        const dto = requestorTemplate;
        const dvo = await requestorExpander.expandRelationshipTemplateDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.id);
        expect(dvo.type).toBe("RelationshipTemplateDVO");
    });

    test("RequestDVO for requestor and accept", async () => {
        const requestResult = await requestorConsumption.incomingRequests.getRequests({
            query: {
                source: { reference: requestorTemplate.id }
            }
        });
        expect(requestResult.isSuccess).toBe(true);
        expect(requestResult.value).toHaveLength(1);

        const dto = requestResult.value[0];
        const dvo = await requestorExpander.expandLocalRequestDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.isOwn).toBe(false);
        expect(dvo.status).toBe("DecisionRequired");
        expect(dvo.statusText).toBe("i18n://dvo.localRequest.status.DecisionRequired");
        expect(dvo.type).toBe("LocalRequestDVO");
        expect(dvo.content.type).toBe("RequestDVO");
        expect(dvo.content.items).toHaveLength(1);
        expect(dvo.isDecidable).toBe(true);

        const acceptResult = await requestorConsumption.incomingRequests.accept({
            requestId: dto.id,
            items: [{ accept: true, attribute: resultItem.content } as AcceptReadAttributeRequestItemParametersJSON]
        });
        expect(acceptResult.isSuccess).toBe(true);
    });

    test("Test the relationship for requestor", async () => {});

    test("Test the relationship for templator", async () => {});

    test("check the GivenName", async () => {
        const query: IdentityAttributeQueryJSON = {
            "@type": "IdentityAttributeQuery",
            valueType: "GivenName"
        };
        const expandedQuery = await templatorExpander.processIdentityAttributeQuery(query);
        expect(expandedQuery).toBeDefined();
        expect(expandedQuery.type).toBe("ProcessedIdentityAttributeQueryDVO");
        expect(expandedQuery.name).toBe("i18n://dvo.attribute.name.GivenName");
        expect(expandedQuery.description).toBe("i18n://dvo.attribute.description.GivenName");
        expect(expandedQuery.valueType).toBe("GivenName");
        expect(expandedQuery.validFrom).toBeUndefined();
        expect(expandedQuery.validTo).toBeUndefined();
        expect(expandedQuery.renderHints["@type"]).toBe("RenderHints");
        expect(expandedQuery.renderHints.technicalType).toBe("String");
        expect(expandedQuery.renderHints.editType).toBe("InputLike");
        expect(expandedQuery.valueHints["@type"]).toBe("ValueHints");
        expect(expandedQuery.valueHints.max).toBe(200);
        expect(expandedQuery.results).toHaveLength(2);

        let dvo: RepositoryAttributeDVO = expandedQuery.results[0] as RepositoryAttributeDVO;
        let attribute = attributes[0];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("RepositoryAttributeDVO");
        expect(dvo.id).toStrictEqual(attribute.id);
        expect(dvo.name).toBe("i18n://dvo.attribute.name.GivenName");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.GivenName");
        expect(dvo.date).toStrictEqual(attribute.createdAt);
        expect(dvo.content).toStrictEqual(attribute.content);
        expect(dvo.value.value).toBe("Hugo");
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.sharedWith).toStrictEqual([]);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("String");
        expect(dvo.renderHints.editType).toBe("InputLike");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.max).toBe(200);

        dvo = expandedQuery.results[1] as RepositoryAttributeDVO;
        attribute = attributes[1];
        expect(dvo).toBeDefined();
        expect(dvo.type).toBe("RepositoryAttributeDVO");
        expect(dvo.id).toStrictEqual(attribute.id);
        expect(dvo.name).toBe("i18n://dvo.attribute.name.GivenName");
        expect(dvo.description).toBe("i18n://dvo.attribute.description.GivenName");
        expect(dvo.date).toStrictEqual(attribute.createdAt);
        expect(dvo.content).toStrictEqual(attribute.content);
        expect(dvo.value.value).toBe("Egon");
        expect(dvo.createdAt).toStrictEqual(attribute.createdAt);
        expect(dvo.isOwn).toBe(true);
        expect(dvo.isValid).toBe(true);
        expect(dvo.sharedWith).toStrictEqual([]);
        expect(dvo.owner.type).toBe("IdentityDVO");
        expect(dvo.owner.id).toStrictEqual(attribute.content.owner);
        expect(dvo.owner.name).toBe("i18n://dvo.identity.self.name");
        expect(dvo.owner.isSelf).toBe(true);
        expect(dvo.renderHints["@type"]).toBe("RenderHints");
        expect(dvo.renderHints.technicalType).toBe("String");
        expect(dvo.renderHints.editType).toBe("InputLike");
        expect(dvo.valueHints["@type"]).toBe("ValueHints");
        expect(dvo.valueHints.max).toBe(200);
    });
});
