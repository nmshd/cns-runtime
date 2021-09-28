import { Result } from "@js-soft/ts-utils";
import { ConsumptionIds, RelationshipAttribute, RelationshipInfo, RelationshipInfoController, RelationshipTheme } from "@nmshd/consumption";
import { IAttribute } from "@nmshd/content";
import { AccountController, BackboneIds, CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RelationshipAttributeDTO, RelationshipInfoDTO, RelationshipThemeDTO } from "../../../types";
import { IdValidator, RelationshipAttributeDTOValidator, RuntimeErrors, RuntimeValidator } from "../../common";
import { UseCase } from "../../common/UseCase";
import { RelationshipInfoMapper } from "./RelationshipInfoMapper";

export interface CreateRelationshipInfoRequest {
    relationshipId: string;
    attributes: RelationshipAttributeDTO[];
    isPinned: boolean;
    title: string;
    description?: string;
    userTitle?: string;
    userDescription?: string;
    theme?: RelationshipThemeDTO;
}

class CreateRelationshipInfoRequestValidator extends RuntimeValidator<CreateRelationshipInfoRequest> {
    public constructor() {
        super();

        this.validateIfAny((x) => x.relationshipId).fulfills(IdValidator.required(BackboneIds.relationship));
        this.validateIfEach((x) => x.attributes).fulfills(RelationshipAttributeDTOValidator.required());
    }
}

export class CreateRelationshipInfoUseCase extends UseCase<CreateRelationshipInfoRequest, RelationshipInfoDTO> {
    public constructor(
        @Inject private readonly relationshipInfoController: RelationshipInfoController,
        @Inject private readonly accountController: AccountController,
        @Inject validator: CreateRelationshipInfoRequestValidator
    ) {
        super(validator);
    }

    protected async executeInternal(request: CreateRelationshipInfoRequest): Promise<Result<RelationshipInfoDTO>> {
        const relationshipId = CoreId.from(request.relationshipId);
        const existingRelationshipInfo = await this.relationshipInfoController.getRelationshipInfoByRelationship(relationshipId);
        if (existingRelationshipInfo !== undefined) {
            return Result.fail(RuntimeErrors.relationshipInfo.relationshipInfoExists(relationshipId.toString()));
        }

        const attributes = await Promise.all(
            request.attributes.map((a) => {
                return RelationshipAttribute.from({
                    name: a.name,
                    content: a.content as IAttribute,
                    sharedItem: CoreId.from(a.sharedItem)
                });
            })
        );
        const theme = request.theme === undefined ? undefined : await RelationshipTheme.from(request.theme);
        const parameters = await RelationshipInfo.from({
            id: await ConsumptionIds.relationshipInfo.generate(),
            relationshipId: relationshipId,
            attributes: attributes,
            isPinned: request.isPinned,
            title: request.title,
            description: request.description,
            userTitle: request.userTitle,
            userDescription: request.userDescription,
            theme: theme
        });
        await this.relationshipInfoController.createRelationshipInfo(parameters);
        await this.accountController.syncDatawallet();
        return Result.ok(RelationshipInfoMapper.toRelationshipInfoDTO(parameters));
    }
}
