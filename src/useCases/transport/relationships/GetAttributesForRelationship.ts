import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttribute, ConsumptionAttributesController, ConsumptionAttributeShareInfo } from "@nmshd/consumption";
import { AbstractAttribute } from "@nmshd/content";
import { CoreId, Relationship, RelationshipsController } from "@nmshd/transport";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeErrors, SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { AttributeMapper } from "../../consumption";

export interface GetAttributesForRelationshipRequest {
    /*
     * @pattern REL[A-Za-z0-9]{17}
     */
    id: string;
}

export interface GetAttributesForRelationshipResponse extends Array<ConsumptionAttributeDTO> {}

class Validator extends SchemaValidator<GetAttributesForRelationshipRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("GetRelationshipRequest"));
    }
}

export class GetAttributesForRelationshipUseCase extends UseCase<GetAttributesForRelationshipRequest, GetAttributesForRelationshipResponse> {
    public constructor(
        @Inject private readonly relationshipsController: RelationshipsController,
        @Inject private readonly attributesController: ConsumptionAttributesController,
        @Inject validator: Validator
    ) {
        super(validator);
    }

    protected async executeInternal(request: GetAttributesForRelationshipRequest): Promise<Result<GetAttributesForRelationshipResponse>> {
        const relationship = await this.relationshipsController.getRelationship(CoreId.from(request.id));
        if (!relationship) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Relationship));
        }

        const attributes = await this.attributesController.getConsumptionAttributes({
            $or: [
                {
                    // content.owner
                    [`${nameof<ConsumptionAttribute>((x) => x.content)}.${nameof<AbstractAttribute>((x) => x.owner)}`]: relationship.peer
                },
                {
                    // shareInfo.peer
                    [`${nameof<ConsumptionAttribute>((x) => x.shareInfo)}.${nameof<ConsumptionAttributeShareInfo>((x) => x.peer)}`]: relationship.peer
                }
            ]
        });
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
