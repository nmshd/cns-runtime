import { EventBus } from "@js-soft/ts-utils";
import { AcceptProposeAttributeRequestItemParametersJSON, DecideRequestItemGroupParametersJSON, LocalRequestStatus } from "@nmshd/consumption";
import { GivenName, IdentityAttribute, IdentityAttributeQuery, ProposeAttributeRequestItem, Surname } from "@nmshd/content";
import { CoreAddress } from "@nmshd/transport";
import {
    ConsumptionServices,
    DataViewExpander,
    DecidableProposeAttributeRequestItemDVO,
    IncomingRequestStatusChangedEvent,
    LocalAttributeDTO,
    OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent,
    RelationshipTemplateDTO,
    RequestItemGroupDVO,
    TransportServices
} from "../../src";
import { createTemplate, RuntimeServiceProvider, syncUntilHasRelationships, waitForEvent } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let templatorAddress: string;
let requestorAddress: string;
let templatorTransport: TransportServices;
let templatorConsumption: ConsumptionServices;
let templatorExpander: DataViewExpander;
let templatorEventBus: EventBus;
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
    templatorEventBus = runtimeServices[0].eventBus;
    templatorAddress = (await templatorTransport.account.getIdentityInfo()).value.address;
    requestorTransport = runtimeServices[1].transport;
    requestorConsumption = runtimeServices[1].consumption;
    requestorExpander = runtimeServices[1].expander;
    requestorEventBus = runtimeServices[1].eventBus;
    requestorAddress = (await requestorTransport.account.getIdentityInfo()).value.address;
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
        const templatorAttribute1 = await templatorConsumption.attributes.createAttribute({
            content: {
                "@type": "IdentityAttribute",
                owner: templatorAddress,
                value: {
                    "@type": "GivenName",
                    value: "Theo"
                }
            }
        });
        const templatorAttribute2 = await templatorConsumption.attributes.createAttribute({
            content: {
                "@type": "IdentityAttribute",
                owner: templatorAddress,
                value: {
                    "@type": "Surname",
                    value: "Templator"
                }
            }
        });
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
                            {
                                "@type": "CreateAttributeRequestItem",
                                mustBeAccepted: true,
                                attribute: templatorAttribute1.value.content,
                                sourceAttributeId: templatorAttribute1.value.id
                            },
                            {
                                "@type": "CreateAttributeRequestItem",
                                mustBeAccepted: true,
                                attribute: templatorAttribute2.value.content,
                                sourceAttributeId: templatorAttribute2.value.id
                            }
                        ]
                    },
                    {
                        "@type": "RequestItemGroup",
                        mustBeAccepted: true,
                        title: "Proposed Attributes",
                        items: [
                            ProposeAttributeRequestItem.from({
                                mustBeAccepted: true,
                                query: IdentityAttributeQuery.from({
                                    valueType: "GivenName"
                                }),
                                attribute: IdentityAttribute.from({
                                    owner: CoreAddress.from(templatorAddress),
                                    value: GivenName.fromAny({
                                        value: "Theo"
                                    })
                                })
                            }),
                            ProposeAttributeRequestItem.from({
                                mustBeAccepted: true,
                                query: IdentityAttributeQuery.from({
                                    valueType: "Surname"
                                }),
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
        const waitForIncomingRequest = waitForEvent(requestorEventBus, IncomingRequestStatusChangedEvent, 2000, (e) => e.data.newStatus === LocalRequestStatus.DecisionRequired);
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

        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.expiresAt).toStrictEqual(dto.expiresAt);
        expect(dvo.createdBy.id).toStrictEqual(dto.createdBy);
        expect(dvo.name).toStrictEqual(dto.content.title ? dto.content.title : "i18n://dvo.template.name");
        expect(dvo.isOwn).toBe(true);
        expect(dvo.maxNumberOfAllocations).toBe(1);

        expect(dvo.onNewRelationship!.type).toBe("RequestDVO");
        expect(dvo.onNewRelationship!.items).toHaveLength(2);

        let item = dvo.onNewRelationship!.items[0] as RequestItemGroupDVO;
        expect(item.type).toBe("RequestItemGroupDVO");
        expect(item.items).toHaveLength(2);
        expect(item.items[0].type).toBe("CreateAttributeRequestItemDVO");
        expect(item.items[1].type).toBe("CreateAttributeRequestItemDVO");

        item = dvo.onNewRelationship!.items[1] as RequestItemGroupDVO;
        expect(item.type).toBe("RequestItemGroupDVO");
        expect(item.items).toHaveLength(2);
        expect(item.items[0].type).toBe("ProposeAttributeRequestItemDVO");
        expect(item.items[1].type).toBe("ProposeAttributeRequestItemDVO");
    });

    test("TemplateDVO for requestor", async () => {
        const dto = requestorTemplate;
        const dvo = await requestorExpander.expandRelationshipTemplateDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.id);
        expect(dvo.type).toBe("PeerRelationshipTemplateDVO");

        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.expiresAt).toStrictEqual(dto.expiresAt);
        expect(dvo.createdBy.id).toStrictEqual(dto.createdBy);
        expect(dvo.name).toStrictEqual(dto.content.title ? dto.content.title : "i18n://dvo.template.name");
        expect(dvo.isOwn).toBe(false);
        expect(dvo.maxNumberOfAllocations).toBe(1);

        expect(dvo.onNewRelationship!.type).toBe("LocalRequestDVO");
        expect(dvo.onNewRelationship!.items).toHaveLength(2);

        let item = dvo.onNewRelationship!.items[0] as RequestItemGroupDVO;
        expect(item.type).toBe("RequestItemGroupDVO");
        expect(item.items).toHaveLength(2);
        expect(item.items[0].type).toBe("DecidableCreateAttributeRequestItemDVO");
        expect(item.items[1].type).toBe("DecidableCreateAttributeRequestItemDVO");

        item = dvo.onNewRelationship!.items[1] as RequestItemGroupDVO;
        expect(item.type).toBe("RequestItemGroupDVO");
        expect(item.items).toHaveLength(2);
        expect(item.items[0].type).toBe("DecidableProposeAttributeRequestItemDVO");
        expect(item.items[1].type).toBe("DecidableProposeAttributeRequestItemDVO");
    });

    test("RequestDVO for requestor and accept", async () => {
        const requestResult = await requestorConsumption.incomingRequests.getRequests({
            query: {
                "source.reference": requestorTemplate.id
            }
        });
        expect(requestResult).toBeSuccessful();
        expect(requestResult.value).toHaveLength(1);

        const dto = requestResult.value[0];
        const dvo = await requestorExpander.expandLocalRequestDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.isOwn).toBe(false);
        expect(dvo.status).toBe("DecisionRequired");
        expect(dvo.statusText).toBe("i18n://dvo.localRequest.status.DecisionRequired");
        expect(dvo.type).toBe("LocalRequestDVO");
        expect(dvo.content.type).toBe("RequestDVO");
        expect(dvo.content.items).toHaveLength(2);
        expect(dvo.isDecidable).toBe(true);

        const proposeItemGroup = dvo.content.items[1] as RequestItemGroupDVO;

        const firstProposeItem = proposeItemGroup.items[0] as DecidableProposeAttributeRequestItemDVO;
        const secondProposeItem = proposeItemGroup.items[1] as DecidableProposeAttributeRequestItemDVO;

        const acceptResult = await requestorConsumption.incomingRequests.accept({
            requestId: dto.id,
            items: [
                { items: [{ accept: true }, { accept: true }] } as DecideRequestItemGroupParametersJSON,
                {
                    items: [
                        { accept: true, attribute: firstProposeItem.attribute.content } as AcceptProposeAttributeRequestItemParametersJSON,
                        { accept: true, attribute: secondProposeItem.attribute.content } as AcceptProposeAttributeRequestItemParametersJSON
                    ]
                } as DecideRequestItemGroupParametersJSON
            ]
        });
        expect(acceptResult).toBeSuccessful();
    });

    test("Test the accepted request for requestor", async () => {
        const requestResult = await requestorConsumption.incomingRequests.getRequests({
            query: {
                "source.reference": requestorTemplate.id
            }
        });
        expect(requestResult).toBeSuccessful();
        expect(requestResult.value).toHaveLength(1);

        const dto = requestResult.value[0];
        const dvo = await requestorExpander.expandLocalRequestDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.isOwn).toBe(false);
        expect(dvo.status).toBe("Decided");
        expect(dvo.statusText).toBe("i18n://dvo.localRequest.status.Decided");
        expect(dvo.type).toBe("LocalRequestDVO");
        expect(dvo.content.type).toBe("RequestDVO");
        expect(dvo.content.items).toHaveLength(2);
        expect(dvo.isDecidable).toBe(false);
    });

    test("Test the accepted template for requestor", async () => {
        const dto = requestorTemplate;
        const dvo = await requestorExpander.expandRelationshipTemplateDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.id);
        expect(dvo.type).toBe("PeerRelationshipTemplateDVO");

        expect(dvo.date).toStrictEqual(dto.createdAt);
        expect(dvo.expiresAt).toStrictEqual(dto.expiresAt);
        expect(dvo.createdBy.id).toStrictEqual(dto.createdBy);
        expect(dvo.name).toStrictEqual(dto.content.title ? dto.content.title : "i18n://dvo.template.name");
        expect(dvo.isOwn).toBe(false);
        expect(dvo.maxNumberOfAllocations).toBe(1);

        expect(dvo.onNewRelationship!.type).toBe("LocalRequestDVO");
        expect(dvo.onNewRelationship!.items).toHaveLength(2);

        let item = dvo.onNewRelationship!.items[0] as RequestItemGroupDVO;
        expect(item.type).toBe("RequestItemGroupDVO");
        expect(item.items).toHaveLength(2);
        expect(item.items[0].type).toBe("CreateAttributeRequestItemDVO");
        expect(item.items[1].type).toBe("CreateAttributeRequestItemDVO");

        item = dvo.onNewRelationship!.items[1] as RequestItemGroupDVO;
        expect(item.type).toBe("RequestItemGroupDVO");
        expect(item.items).toHaveLength(2);
        expect(item.items[0].type).toBe("ProposeAttributeRequestItemDVO");
        expect(item.items[1].type).toBe("ProposeAttributeRequestItemDVO");
    });

    test("test the attributes on requestor side", async () => {
        const attributeResult = await requestorConsumption.attributes.getAttributes({
            query: {
                "shareInfo.peer": templatorAddress
            }
        });
        expect(attributeResult).toBeSuccessful();
        expect(attributeResult.value).toHaveLength(4);
    });

    test("Test the request for templator", async () => {
        const waitForOutgoingRequest = waitForEvent(templatorEventBus, OutgoingRequestFromRelationshipCreationChangeCreatedAndCompletedEvent, 50000);
        await syncUntilHasRelationships(templatorTransport);
        await waitForOutgoingRequest;
        const requestResult = await templatorConsumption.outgoingRequests.getRequests({
            query: {
                "source.reference": requestorTemplate.id
            }
        });
        expect(requestResult).toBeSuccessful();
        expect(requestResult.value).toHaveLength(1);

        const dto = requestResult.value[0];
        const dvo = await requestorExpander.expandLocalRequestDTO(dto);
        expect(dvo).toBeDefined();
        expect(dvo.isOwn).toBe(true);
        expect(dvo.status).toBe("Completed");
        expect(dvo.statusText).toBe("i18n://dvo.localRequest.status.Completed");
        expect(dvo.type).toBe("LocalRequestDVO");
        expect(dvo.content.type).toBe("RequestDVO");
        expect(dvo.content.items).toHaveLength(2);
        expect(dvo.isDecidable).toBe(false);
    });

    test("check the attributes on templator side", async () => {
        const attributeResult = await templatorConsumption.attributes.getAttributes({
            query: {
                "shareInfo.peer": requestorAddress
            }
        });
        expect(attributeResult).toBeSuccessful();
        expect(attributeResult.value).toHaveLength(4);
    });
});
