import { ApplicationError, Result } from "@js-soft/ts-utils";
import { IncomingRequestsController } from "@nmshd/consumption";
import { CoreId } from "@nmshd/transport";
import { Inject } from "typescript-ioc";
import { LocalRequestDTO } from "../../../types";
import { SchemaRepository, SchemaValidator, UseCase } from "../../common";
import { RequestMapper } from "./RequestMapper";

export interface CheckPrerequisitesOfIncomingRequestRequest {
    /**
     * @pattern REQ[A-Za-z0-9]{17}
     */
    requestId: string;
}

class Validator extends SchemaValidator<CheckPrerequisitesOfIncomingRequestRequest> {
    public constructor(@Inject schemaRepository: SchemaRepository) {
        super(schemaRepository.getSchema("CheckPrerequisitesOfIncomingRequestRequest"));
    }
}

export class CheckPrerequisitesOfIncomingRequestUseCase extends UseCase<CheckPrerequisitesOfIncomingRequestRequest, LocalRequestDTO> {
    public constructor(@Inject validator: Validator, @Inject private readonly incomingRequestsController: IncomingRequestsController) {
        super(validator);
    }

    protected async executeInternal(request: CheckPrerequisitesOfIncomingRequestRequest): Promise<Result<LocalRequestDTO, ApplicationError>> {
        const localRequest = await this.incomingRequestsController.checkPrerequisites({
            requestId: CoreId.from(request.requestId)
        });

        return Result.ok(RequestMapper.toLocalRequestDTO(localRequest));
    }
}
