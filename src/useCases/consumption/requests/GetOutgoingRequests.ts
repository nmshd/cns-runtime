import { QueryTranslator } from "@js-soft/docdb-querytranslator";
import { ApplicationError, Result } from "@js-soft/ts-utils";
import { ConsumptionRequest, ConsumptionRequestSource, ConsumptionResponse, ConsumptionResponseSource, OutgoingRequestsController } from "@nmshd/consumption";
import { RequestItemGroupJSON, RequestItemJSON, RequestJSON, ResponseItemGroupJSON, ResponseItemJSON, ResponseJSON } from "@nmshd/content";
import { nameof } from "ts-simple-nameof";
import { Inject } from "typescript-ioc";
import { ConsumptionRequestDTO, ConsumptionRequestSourceDTO, ConsumptionResponseDTO, ConsumptionResponseSourceDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { UseCase } from "../../common";
import { flattenObject } from "./flattenObject";
import { RequestMapper } from "./RequestMapper";

export interface GetOutgoingRequestsRequest {
    query?: GetOutgoingRequestsRequestQuery;
}

export interface GetOutgoingRequestsRequestQuery {
    id?: string;
    peer?: string;
    createdAt?: string;
    status?: string;
    content?: {
        expiresAt?: string;
        items?: {
            "@type"?: string;
        };
    };
    source?: {
        type?: string;
        reference?: string;
    };
    response?: {
        createdAt?: string;
        source?: {
            type?: string;
            reference?: string;
        };
        content?: {
            result?: string;
            items?: {
                "@type"?: string;
                items?: {
                    "@type"?: string;
                };
            };
        };
    };
    [key: string]: unknown;
}

export class GetOutgoingRequestsUseCase extends UseCase<GetOutgoingRequestsRequest, ConsumptionRequestDTO[]> {
    private static readonly queryTranslator = new QueryTranslator({
        whitelist: {
            // id
            [nameof<ConsumptionRequestDTO>((x) => x.id)]: true,

            // peer
            [nameof<ConsumptionRequestDTO>((x) => x.peer)]: true,

            // createdAt
            [nameof<ConsumptionRequestDTO>((x) => x.createdAt)]: true,

            // status
            [nameof<ConsumptionRequestDTO>((x) => x.status)]: true,

            // content.expiresAt
            [`${nameof<ConsumptionRequestDTO>((x) => x.content)}.${nameof<RequestJSON>((x) => x.expiresAt)}`]: true,

            // content.items.@type
            [`${nameof<ConsumptionRequestDTO>((x) => x.content)}.${nameof<RequestJSON>((x) => x.items)}.${nameof<RequestItemJSON>((x) => x["@type"])}`]: true,

            // content.items.items.@type
            [`${nameof<ConsumptionRequestDTO>((x) => x.content)}.${nameof<RequestJSON>((x) => x.items)}.${nameof<RequestItemGroupJSON>((x) => x.items)}.${nameof<RequestItemJSON>(
                (x) => x["@type"]
            )}`]: true,

            // source.type
            [`${nameof<ConsumptionRequestDTO>((x) => x.source)}.${nameof<ConsumptionRequestSourceDTO>((x) => x.type)}`]: true,

            // source.reference
            [`${nameof<ConsumptionRequestDTO>((x) => x.source)}.${nameof<ConsumptionRequestSourceDTO>((x) => x.reference)}`]: true,

            // response.createdAt
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.createdAt)}`]: true,

            // response.source.type
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.source)}.${nameof<ConsumptionResponseSourceDTO>((x) => x.type)}`]: true,

            // response.source.reference
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.source)}.${nameof<ConsumptionResponseSourceDTO>((x) => x.reference)}`]:
                true,

            // response.content.result
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.content)}.${nameof<ResponseJSON>((x) => x.result)}`]: true,

            // response.content.items.@type
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.content)}.${nameof<ResponseJSON>(
                (x) => x.items
            )}.${nameof<ResponseItemJSON>((x) => x["@type"])}`]: true,

            // response.content.items.items.@type
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.content)}.${nameof<ResponseJSON>(
                (x) => x.items
            )}.${nameof<ResponseItemGroupJSON>((x) => x.items)}.${nameof<ResponseItemJSON>((x) => x["@type"])}`]: true
        },
        alias: {
            // id
            [nameof<ConsumptionRequestDTO>((x) => x.id)]: nameof<ConsumptionRequest>((x) => x.id),

            // peer
            [nameof<ConsumptionRequestDTO>((x) => x.peer)]: nameof<ConsumptionRequest>((x) => x.peer),

            // createdAt
            [nameof<ConsumptionRequestDTO>((x) => x.createdAt)]: nameof<ConsumptionRequest>((x) => x.createdAt),

            // status
            [nameof<ConsumptionRequestDTO>((x) => x.status)]: nameof<ConsumptionRequest>((x) => x.status),

            // content.expiresAt
            [`${nameof<ConsumptionRequestDTO>((x) => x.content)}.${nameof<RequestJSON>((x) => x.expiresAt)}`]: `${nameof<ConsumptionRequest>(
                (x) => x.content
            )}.${nameof<RequestJSON>((x) => x.expiresAt)}`,

            // content.items.@type
            [`${nameof<ConsumptionRequestDTO>((x) => x.content)}.${nameof<RequestJSON>((x) => x.items)}.${nameof<RequestItemJSON>(
                (x) => x["@type"]
            )}`]: `${nameof<ConsumptionRequest>((x) => x.content)}.${nameof<RequestJSON>((x) => x.items)}.${nameof<RequestItemJSON>((x) => x["@type"])}`,

            // content.items.items.@type
            [`${nameof<ConsumptionRequestDTO>((x) => x.content)}.${nameof<RequestJSON>((x) => x.items)}.${nameof<RequestItemGroupJSON>((x) => x.items)}.${nameof<RequestItemJSON>(
                (x) => x["@type"]
            )}`]: `${nameof<ConsumptionRequest>((x) => x.content)}.${nameof<RequestJSON>((x) => x.items)}.${nameof<RequestItemGroupJSON>((x) => x.items)}.${nameof<RequestItemJSON>(
                (x) => x["@type"]
            )}`,

            // source.type
            [`${nameof<ConsumptionRequestDTO>((x) => x.source)}.${nameof<ConsumptionRequestSourceDTO>((x) => x.type)}`]: `${nameof<ConsumptionRequest>(
                (x) => x.source
            )}.${nameof<ConsumptionRequestSource>((x) => x.type)}`,

            // source.reference
            [`${nameof<ConsumptionRequestDTO>((x) => x.source)}.${nameof<ConsumptionRequestSourceDTO>((x) => x.reference)}`]: `${nameof<ConsumptionRequest>(
                (x) => x.source
            )}.${nameof<ConsumptionRequestSource>((x) => x.reference)}`,

            // response.createdAt
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.createdAt)}`]: `${nameof<ConsumptionRequest>(
                (x) => x.response
            )}.${nameof<ConsumptionResponse>((x) => x.createdAt)}`,

            // response.source.type
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.source)}.${nameof<ConsumptionResponseSourceDTO>(
                (x) => x.type
            )}`]: `${nameof<ConsumptionRequest>((x) => x.response)}.${nameof<ConsumptionResponse>((x) => x.source)}.${nameof<ConsumptionResponseSource>((x) => x.type)}`,

            // response.source.reference
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.source)}.${nameof<ConsumptionResponseSourceDTO>((x) => x.reference)}`]:
                true,

            // response.content.result
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.content)}.${nameof<ResponseJSON>(
                (x) => x.result
            )}`]: `${nameof<ConsumptionRequest>((x) => x.response)}.${nameof<ConsumptionResponse>((x) => x.content)}.${nameof<ResponseJSON>((x) => x.result)}`,

            // response.content.items.@type
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.content)}.${nameof<ResponseJSON>(
                (x) => x.items
            )}.${nameof<ResponseItemJSON>((x) => x["@type"])}`]: `${nameof<ConsumptionRequest>((x) => x.response)}.${nameof<ConsumptionResponse>(
                (x) => x.content
            )}.${nameof<ResponseJSON>((x) => x.items)}.${nameof<ResponseItemJSON>((x) => x["@type"])}`,

            // response.content.items.items.@type
            [`${nameof<ConsumptionRequestDTO>((x) => x.response)}.${nameof<ConsumptionResponseDTO>((x) => x.content)}.${nameof<ResponseJSON>(
                (x) => x.items
            )}.${nameof<ResponseItemGroupJSON>((x) => x.items)}.${nameof<ResponseItemJSON>((x) => x["@type"])}`]: `${nameof<ConsumptionRequest>(
                (x) => x.response
            )}.${nameof<ConsumptionResponse>((x) => x.content)}.${nameof<ResponseJSON>((x) => x.items)}.${nameof<ResponseItemGroupJSON>((x) => x.items)}.${nameof<ResponseItemJSON>(
                (x) => x["@type"]
            )}`
        }
    });

    public constructor(@Inject private readonly outgoingRequestsController: OutgoingRequestsController) {
        super();
    }

    protected async executeInternal(request: GetOutgoingRequestsRequest): Promise<Result<ConsumptionRequestDTO[], ApplicationError>> {
        const flattenedQuery = flattenObject(request.query);
        const dbQuery = GetOutgoingRequestsUseCase.queryTranslator.parse(flattenedQuery);
        const consumptionRequests = await this.outgoingRequestsController.getOutgoingRequests(dbQuery);

        const dtos = RequestMapper.toConsumptionRequestDTOList(consumptionRequests);

        return Result.ok(dtos);
    }
}
