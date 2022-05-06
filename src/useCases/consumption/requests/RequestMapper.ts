import { ConsumptionRequest } from "@nmshd/consumption";
import { RequestJSON, ResponseJSON } from "@nmshd/content";
import { ConsumptionRequestDTO } from "../../../types";

export class RequestMapper {
    public static toConsumptionRequestDTO(request: ConsumptionRequest): ConsumptionRequestDTO {
        return {
            id: request.id.toString(),
            isOwn: request.isOwn,
            peer: request.peer.toString(),
            createdAt: request.createdAt.toString(),
            content: request.content.toJSON() as RequestJSON,
            source: request.source
                ? {
                      type: request.source.type,
                      reference: request.source.reference.toString()
                  }
                : undefined,
            response: request.response
                ? {
                      createdAt: request.response.createdAt.toString(),
                      content: request.response.content.toJSON() as ResponseJSON,
                      source: request.response.source
                          ? {
                                type: request.response.source.type,
                                reference: request.response.source.reference.toString()
                            }
                          : undefined
                  }
                : undefined,
            status: request.status
        };
    }

    public static toConsumptionRequestDTOList(requests: ConsumptionRequest[]): ConsumptionRequestDTO[] {
        return requests.map((request) => this.toConsumptionRequestDTO(request));
    }
}
