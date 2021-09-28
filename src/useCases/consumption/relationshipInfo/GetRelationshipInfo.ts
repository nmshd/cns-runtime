import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, RelationshipInfo, RelationshipInfoController } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { AbstractValidator } from "fluent-ts-validator";
import { Inject } from "typescript-ioc";
import { RelationshipInfoDTO } from "../../../types";
import { IdValidator } from "../../common";
import { RuntimeErrors } from "../../common/RuntimeErrors";
import { UseCase } from "../../common/UseCase";
import { RelationshipInfoMapper } from "./RelationshipInfoMapper";

export interface GetRelationshipInfoRequest {
    id: string;
}

class GetRelationshipInfoRequestValidator extends AbstractValidator<GetRelationshipInfoRequest> {
    public constructor() {
        super();

        this.validateIfAny((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.relationshipInfo));
    }
}

export class GetRelationshipInfoUseCase extends UseCase<GetRelationshipInfoRequest, RelationshipInfoDTO> {
    public constructor(@Inject private readonly relationshipInfoController: RelationshipInfoController, @Inject validator: GetRelationshipInfoRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetRelationshipInfoRequest): Promise<Result<RelationshipInfoDTO>> {
        const relationshipInfo = await this.relationshipInfoController.getRelationshipInfo(CoreId.from(request.id));
        if (!relationshipInfo) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipInfo));
        }
        return Result.ok(RelationshipInfoMapper.toRelationshipInfoDTO(relationshipInfo));
    }
}
