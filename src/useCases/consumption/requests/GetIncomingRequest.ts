import { ApplicationError, Result } from "@js-soft/ts-utils";
import { ConsumptionRequest, IncomingRequestsController } from "@nmshd/consumption";
import { CoreId, TransportErrors } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { ConsumptionRequestDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface GetIncomingRequestRequest {
    id: string;
}

export class GetIncomingRequestUseCase extends UseCase<GetIncomingRequestRequest, ConsumptionRequestDTO> {
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController) {
        super();
    }

    protected async executeInternal(request: GetIncomingRequestRequest): Promise<Result<ConsumptionRequestDTO, ApplicationError>> {
        const consumptionRequest = await this.incomingRequestsController.getIncomingRequest(CoreId.from(request.id));

        if (!consumptionRequest) {
            return Result.fail(TransportErrors.general.recordNotFound(ConsumptionRequest, request.id));
        }

        const dto = RequestMapper.toConsumptionRequestDTO(consumptionRequest);

        return Result.ok(dto);
    }
}
