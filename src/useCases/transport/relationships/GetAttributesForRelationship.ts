import { Result } from "@js-soft/ts-utils";
import { LocalAttribute, LocalAttributesController, LocalAttributeShareInfo } from "@nmshd/consumption";
import { AbstractAttribute } from "@nmshd/content";
import { CoreId, Relationship, RelationshipsController } from "@nmshd/transport";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { LocalAttributeDTO } from "../../../types";
import { RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { AttributeMapper } from "../../consumption";

export interface GetAttributesForRelationshipRequest {
    /*
     * @pattern REL[A-Za-z0-9]{17}
     */
    id: string;
}

export interface GetAttributesForRelationshipResponse extends Array<LocalAttributeDTO> {}

class Validator extends SchemaValidator<GetAttributesForRelationshipRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("GetRelationshipRequest"));
    }
}

export class GetAttributesForRelationshipUseCase extends UseCase<GetAttributesForRelationshipRequest, GetAttributesForRelationshipResponse> {
    public constructor(
        @Inject private readonly relationshipsController: RelationshipsController,
        @Inject private readonly attributesController: LocalAttributesController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: GetAttributesForRelationshipRequest): Promise<Result<GetAttributesForRelationshipResponse>> {
        const relationship = await this.relationshipsController.getRelationship(CoreId.from(request.id));
        if (!relationship) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Relationship));
        }

        const peerAddress = relationship.peer.address.toString();
        const query = {
            $or: [
                // content.owner
                { [`${nameof<LocalAttribute>((x) => x.content)}.${nameof<AbstractAttribute>((x) => x.owner)}`]: peerAddress },
                // shareInfo.peer
                { [`${nameof<LocalAttribute>((x) => x.shareInfo)}.${nameof<LocalAttributeShareInfo>((x) => x.peer)}`]: peerAddress }
            ]
        };
        const attributes = await this.attributesController.getLocalAttributes(query);

        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
