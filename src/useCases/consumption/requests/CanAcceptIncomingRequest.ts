import { ApplicationError, Result } from "@js-soft/ts-utils";
import { IncomingRequestsController } from "@nmshd/consumption";
import { Inject } from "typescript-ioc";
import { RequestValidationResultDTO } from "../../../types";
import { UseCase } from "../../common";
import { AcceptIncomingRequestRequest } from "./AcceptIncomingRequest";
import { RequestValidationResultMapper } from "./RequestValidationResultMapper";

export class CanAcceptIncomingRequestUseCase extends UseCase<AcceptIncomingRequestRequest, RequestValidationResultDTO> {
    public constructor(@Inject private readonly incomingRequestsController: IncomingRequestsController) {
        super();
    }

    protected async executeInternal(request: AcceptIncomingRequestRequest): Promise<Result<RequestValidationResultDTO, ApplicationError>> {
        const result = await this.incomingRequestsController.canAccept(request);

        const dto = RequestValidationResultMapper.toRequestValidationResultDTO(result);

        return Result.ok(dto);
    }
}
