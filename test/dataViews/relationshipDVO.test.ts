import { GivenName, IdentityAttribute, ReadAttributeAcceptResponseItem, ReadAttributeRequestItem, ResponseItemResult, ResponseResult } from "@nmshd/content";
import { CoreAddress, CoreId } from "@nmshd/transport";
import { DataViewExpander, TransportServices } from "../../src";
import { establishRelationshipWithBodys, RuntimeServiceProvider } from "../lib";

const serviceProvider = new RuntimeServiceProvider();
let transportServices1: TransportServices;
let transportServices2: TransportServices;
let expander1: DataViewExpander;
let expander2: DataViewExpander;

beforeAll(async () => {
    const runtimeServices = await serviceProvider.launch(2);
    transportServices1 = runtimeServices[0].transport;
    transportServices2 = runtimeServices[1].transport;
    expander1 = runtimeServices[0].expander;
    expander2 = runtimeServices[1].expander;
    await establishRelationshipWithBodys(
        transportServices1,
        transportServices2,
        {
            onNewRelationship: {
                "@type": "Request",
                items: [
                    ReadAttributeRequestItem.from({
                        mustBeAccepted: true,
                        query: {
                            valueType: "GivenName"
                        }
                    })
                ]
            }
        },
        {
            response: {
                "@type": "Response",
                result: ResponseResult.Accepted,
                requestId: await CoreId.generate(),
                items: [
                    ReadAttributeAcceptResponseItem.from({
                        result: ResponseItemResult.Accepted,
                        attributeId: await CoreId.generate(),
                        attribute: IdentityAttribute.from({
                            owner: CoreAddress.from((await transportServices1.account.getIdentityInfo()).value.address),
                            value: GivenName.fromAny({
                                value: "AGivenName"
                            })
                        })
                    })
                ]
            }
        }
    );
}, 30000);

afterAll(() => serviceProvider.stop());

describe("RelationshipDVO", () => {
    test("check the relationship dvo for the templator", async () => {
        const dtos = (await transportServices1.relationships.getRelationships({})).value;
        const dvos = await expander1.expandRelationshipDTOs(dtos);
        const dto = dtos[0];
        const dvo = dvos[0];
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.peer);
        expect(dvo.name).toBe(dto.peer.substring(3, 9));
        expect(dvo.description).toBe("i18n://dvo.relationship.Active");
        expect(dvo.type).toBe("IdentityDVO");
        expect(dvo.date).toBe(dto.changes[0].request.createdAt);
        expect(dvo.isSelf).toBe(false);
        expect(dvo.relationship!.id).toBe(dto.id);
        expect(dvo.relationship!.direction).toBe("Incoming");
        expect(dvo.relationship!.status).toBe("Active");
        expect(dvo.relationship!.statusText).toBe("i18n://dvo.relationship.Active");
        expect(dvo.relationship!.changeCount).toBe(1);
        const change = dvo.relationship!.changes[0];
        expect(change.id).toBe(dto.changes[0].id);
        expect(change.type).toBe("RelationshipChangeDVO");
        expect(change.status).toBe(dto.changes[0].status);
        expect(change.statusText).toBe("i18n://dvo.relationshipChange.Accepted");
        expect(change.request.type).toBe("RelationshipChangeRequestDVO");
        expect(change.request.createdAt).toBe(dto.changes[0].request.createdAt);
        expect(change.request.createdBy).toBe(dto.changes[0].request.createdBy);
        expect(change.request.createdByDevice).toBe(dto.changes[0].request.createdByDevice);
        expect(change.request.content).toBe(dto.changes[0].request.content);
        expect(change.isOwn).toBe(false);
        expect(change.response!.type).toBe("RelationshipChangeResponseDVO");
        expect(change.response!.createdAt).toBe(dto.changes[0].response!.createdAt);
        expect(change.response!.createdBy).toBe(dto.changes[0].response!.createdBy);
        expect(change.response!.createdByDevice).toBe(dto.changes[0].response!.createdByDevice);
        expect(change.response!.content).toBe(dto.changes[0].response!.content);
        expect(change.date).toBe(dto.changes[0].response!.createdAt);
    });
    test("check the relationship dvo for the requestor", async () => {
        const dtos = (await transportServices2.relationships.getRelationships({})).value;
        const dvos = await expander2.expandRelationshipDTOs(dtos);
        const dto = dtos[0];
        const dvo = dvos[0];
        expect(dvo).toBeDefined();
        expect(dvo.id).toBe(dto.peer);
        expect(dvo.name).toBe(dto.peer.substring(3, 9));
        expect(dvo.description).toBe("i18n://dvo.relationship.Active");
        expect(dvo.type).toBe("IdentityDVO");
        expect(dvo.date).toBe(dto.changes[0].request.createdAt);
        expect(dvo.isSelf).toBe(false);
        expect(dvo.relationship!.id).toBe(dto.id);
        expect(dvo.relationship!.direction).toBe("Outgoing");
        expect(dvo.relationship!.status).toBe("Active");
        expect(dvo.relationship!.statusText).toBe("i18n://dvo.relationship.Active");
        expect(dvo.relationship!.changeCount).toBe(1);
        const change = dvo.relationship!.changes[0];
        expect(change.id).toBe(dto.changes[0].id);
        expect(change.type).toBe("RelationshipChangeDVO");
        expect(change.status).toBe(dto.changes[0].status);
        expect(change.statusText).toBe("i18n://dvo.relationshipChange.Accepted");
        expect(change.request.type).toBe("RelationshipChangeRequestDVO");
        expect(change.request.createdAt).toBe(dto.changes[0].request.createdAt);
        expect(change.request.createdBy).toBe(dto.changes[0].request.createdBy);
        expect(change.request.createdByDevice).toBe(dto.changes[0].request.createdByDevice);
        expect(change.request.content).toBe(dto.changes[0].request.content);
        expect(change.isOwn).toBe(true);
        expect(change.response!.type).toBe("RelationshipChangeResponseDVO");
        expect(change.response!.createdAt).toBe(dto.changes[0].response!.createdAt);
        expect(change.response!.createdBy).toBe(dto.changes[0].response!.createdBy);
        expect(change.response!.createdByDevice).toBe(dto.changes[0].response!.createdByDevice);
        expect(change.response!.content).toBe(dto.changes[0].response!.content);
        expect(change.date).toBe(dto.changes[0].response!.createdAt);
    });
});
