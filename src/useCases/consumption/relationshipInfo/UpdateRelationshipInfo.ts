import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, IRelationshipTheme, RelationshipAttribute, RelationshipInfo, RelationshipInfoController, RelationshipTheme } from "@nmshd/consumption";
import { IAttribute } from "@nmshd/content";
import { AccountController, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RelationshipAttributeDTO, RelationshipInfoDTO, RelationshipThemeDTO } from "../../../types";
import { IdValidator, RelationshipAttributeDTOValidator, RuntimeValidator } from "../../common";
import { RuntimeErrors } from "../../common/RuntimeErrors";
import { UseCase } from "../../common/UseCase";
import { RelationshipInfoMapper } from "./RelationshipInfoMapper";

/**
 * Overwrite a RelationshipInfo's attributes with the request's corresponding
 * fields. Undefined fields in the request will leave the corresponding
 * RelationshipInfo's attributes untouched.
 */
export interface UpdateRelationshipInfoRequest {
    id: string;
    attributes?: RelationshipAttributeDTO[];
    isPinned?: boolean;
    title?: string;
    description?: string;
    userTitle?: string;
    userDescription?: string;
    theme?: RelationshipThemeDTO;
}

class UpdateRelationshipInfoRequestValidator extends RuntimeValidator<UpdateRelationshipInfoRequest> {
    public constructor() {
        super();

        this.validateIfAny((x) => x.id).fulfills(IdValidator.required(ConsumptionIds.relationshipInfo));
        this.validateIfEachAny((x) => x.attributes).fulfills(RelationshipAttributeDTOValidator.required());
    }
}

export class UpdateRelationshipInfoUseCase extends UseCase<UpdateRelationshipInfoRequest, RelationshipInfoDTO> {
    public constructor(
        @Inject private readonly relationshipInfoController: RelationshipInfoController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: UpdateRelationshipInfoRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: UpdateRelationshipInfoRequest): Promise<Result<RelationshipInfoDTO>> {
        const relationshipInfo = await this.relationshipInfoController.getRelationshipInfo(CoreId.from(request.id));
        if (!relationshipInfo) {
            return Result.fail(RuntimeErrors.general.recordNotFound(RelationshipInfo));
        }

        if (request.attributes !== undefined) {
            relationshipInfo.attributes = await Promise.all(
                request.attributes.map((a) => {
                    return RelationshipAttribute.from({
                        name: a.name,
                        content: a.content as IAttribute,
                        sharedItem: CoreId.from(a.sharedItem)
                    });
                })
            );
        }
        relationshipInfo.isPinned = request.isPinned === undefined ? relationshipInfo.isPinned : request.isPinned;
        relationshipInfo.title = request.title === undefined ? relationshipInfo.title : request.title;
        relationshipInfo.description = request.description === undefined ? relationshipInfo.description : request.description;
        relationshipInfo.userTitle = request.userTitle === undefined ? relationshipInfo.userTitle : request.userTitle;
        relationshipInfo.userDescription = request.userDescription === undefined ? relationshipInfo.userDescription : request.userDescription;
        relationshipInfo.theme = request.theme === undefined ? relationshipInfo.theme : RelationshipTheme.from(request.theme as IRelationshipTheme);

        await this.relationshipInfoController.updateRelationshipInfo(relationshipInfo);
        await this.accountController.syncDatawallet();
        return Result.ok(RelationshipInfoMapper.toRelationshipInfoDTO(relationshipInfo));
    }
}
