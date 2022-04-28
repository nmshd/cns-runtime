import { Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { ConsumptionRequestDTO } from "../../../types/consumption/ConsumptionRequestDTO";
import { CompleteOutgoingRequestRequest, CompleteOutgoingRequestUseCase } from "../../../useCases/consumption/requests/CompleteOutgoingRequest";
import { CreateOutgoingRequestRequest, CreateOutgoingRequestUseCase } from "../../../useCases/consumption/requests/CreateOutgoingRequest";
import {
    CreateOutgoingRequestFromRelationshipCreationChangeRequest,
    CreateOutgoingRequestFromRelationshipCreationChangeUseCase
} from "../../../useCases/consumption/requests/CreateOutgoingRequestFromRelationshipCreationChange";
import { SentOutgoingRequestRequest, SentOutgoingRequestUseCase } from "../../../useCases/consumption/requests/SentOutgoingRequest";

export class OutgoingRequestsFacade {
    public constructor(
        @Inject private readonly createOutgoingRequests: CreateOutgoingRequestUseCase,
        @Inject private readonly sentOutgoingRequests: SentOutgoingRequestUseCase,
        @Inject private readonly createOutgoingRequestFromRelationshipCreationChange: CreateOutgoingRequestFromRelationshipCreationChangeUseCase,
        @Inject private readonly completeOutgoingRequests: CompleteOutgoingRequestUseCase
    ) {}

    public async create(request: CreateOutgoingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.createOutgoingRequests.execute(request);
    }

    public async createFromRelationshipCreationChange(request: CreateOutgoingRequestFromRelationshipCreationChangeRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.createOutgoingRequestFromRelationshipCreationChange.execute(request);
    }

    public async sent(request: SentOutgoingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.sentOutgoingRequests.execute(request);
    }

    public async complete(request: CompleteOutgoingRequestRequest): Promise<Result<ConsumptionRequestDTO>> {
        return await this.completeOutgoingRequests.execute(request);
    }
}

// export type INewCoreId = string | { id: string };

// @serializeOnly("id", "string")
// export class NewCoreId extends Serializable {
//     @serialize()
//     @validate()
//     public id: string;

//     public static from(value: INewCoreId): NewCoreId {
//         return this.fromAny(value);
//     }

//     protected static override preFrom(value: any): any {
//         if (typeof value === "string") {
//             return { id: value };
//         }

//         return value;
//     }
// }

// export interface NewRequestItemJSON extends ContentJSON {
//     mustBeAccepted: boolean;
// }

// export interface INewRequestItem extends ISerializable {
//     mustBeAccepted: boolean;
// }

// @type("NewRequestItem")
// export class NewRequestItem extends Serializable implements INewRequestItem {
//     @serialize()
//     @validate()
//     public mustBeAccepted: boolean;

//     public static from(value: INewRequestItem): NewRequestItem {
//         return this.fromAny(value);
//     }
// }

// export interface INewRequest extends ISerializable {
//     id: INewCoreId;
//     items: INewRequestItem[];
// }

// export interface NewRequestJSON extends ContentJSON {
//     id: INewCoreId;
//     items: NewRequestItemJSON[];
// }

// @type("NewRequest")
// export class NewRequest extends Serializable implements INewRequest {
//     @serialize()
//     @validate()
//     public id: NewCoreId;

//     @serialize()
//     @validate()
//     public items: NewRequestItem[];

//     public static from(value: INewRequest): NewRequest {
//         return this.fromAny(value);
//     }
// }

// export interface INewConsumptionRequest extends ISerializable {
//     id: INewCoreId;
//     content: INewRequest | NewRequestJSON;
// }

// @type("NewConsumptionRequest")
// export class NewConsumptionRequest extends Serializable implements INewConsumptionRequest {
//     @serialize()
//     @validate()
//     public id: NewCoreId;

//     @serialize()
//     @validate()
//     public content: NewRequest;

//     public static from(value: INewConsumptionRequest): NewConsumptionRequest {
//         return this.fromAny(value);
//     }
// }

// const consumptionRequest = NewConsumptionRequest.from({
//     id: NewCoreId.from({ id: "myConsumptionRequestId" }),
//     content: {
//         "@type": "NewRequest",
//         id: "myRequestId",
//         items: [
//             {
//                 mustBeAccepted: true
//             }
//         ]
//     }
// });

// console.log(consumptionRequest);
// console.log(JSON.stringify(consumptionRequest.toJSON(), undefined, 2));

// *** Simple *** //

// export interface ITest extends ISerializable {
//     id: ICoreId;
//     createdAt: ICoreDate;
// }

// export class Test extends Serializable implements ITest {
//     @serialize()
//     @validate()
//     public id: CoreId;

//     @serialize()
//     @validate()
//     public createdAt: CoreDate;

//     public static from(value: ITest): Test {
//         return this.fromAny(value);
//     }
// }

// const t = Test.from({
//     // @ts-ignore
//     id: "test",
//     createdAt: { date: "2022" }
// });

// console.log(t);
