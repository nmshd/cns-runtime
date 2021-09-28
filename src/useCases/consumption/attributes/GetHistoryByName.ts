import { Result } from "@js-soft/ts-utils";
import { ConsumptionAttributesController } from "@nmshd/consumption";
import { Attribute } from "@nmshd/content";
import { Inject } from "typescript-ioc";
import { ConsumptionAttributeDTO } from "../../../types";
import { RuntimeErrors, RuntimeValidator, UseCase } from "../../common";
import { AttributeMapper } from "./AttributeMapper";

export interface GetHistoryByNameRequest {
    name: string;
}

class GetHistoryByNameRequestValidator extends RuntimeValidator<GetHistoryByNameRequest> {
    public constructor() {
        super();

        this.validateIfString((x) => x.name).isDefined();
    }
}

export class GetHistoryByNameUseCase extends UseCase<GetHistoryByNameRequest, ConsumptionAttributeDTO[]> {
    public constructor(@Inject private readonly attributeController: ConsumptionAttributesController, @Inject validator: GetHistoryByNameRequestValidator) {
        super(validator);
    }

    protected async executeInternal(request: GetHistoryByNameRequest): Promise<Result<ConsumptionAttributeDTO[]>> {
        const attributes = await this.attributeController.getAttributeHistoryByName(request.name);
        if (attributes.length === 0) {
            return Result.fail(RuntimeErrors.general.recordNotFound(Attribute));
        }
        return Result.ok(AttributeMapper.toAttributeDTOList(attributes));
    }
}
