import { ApplicationError, Result } from "@js-soft/ts-utils";
import { ICreateOutgoingRequestParameters, OutgoingRequestsController } from "@nmshd/consumption";
import { CoreAddress } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { RequestValidationResultDTO } from "../../../types";
import { UseCase } from "../../common";
import { CreateOutgoingRequestRequest } from "./CreateOutgoingRequest";
import { RequestValidationResultMapper } from "./RequestValidationResultMapper";

export class CanCreateOutgoingRequestUseCase extends UseCase<CreateOutgoingRequestRequest, RequestValidationResultDTO> {
    public constructor(@Inject private readonly outgoingRequestsController: OutgoingRequestsController) {
        super();
    }

    protected async executeInternal(request: CreateOutgoingRequestRequest): Promise<Result<RequestValidationResultDTO, ApplicationError>> {
        const params: ICreateOutgoingRequestParameters = {
            // @ts-expect-error // TODO: remove this as soon as the Type Definitions are correct
            content: request.content,
            peer: CoreAddress.from(request.peer)
        };

        const consumptionRequest = await this.outgoingRequestsController.canCreate(params);

        const dto = RequestValidationResultMapper.toRequestValidationResultDTO(consumptionRequest);

        return Result.ok(dto);
    }
}
