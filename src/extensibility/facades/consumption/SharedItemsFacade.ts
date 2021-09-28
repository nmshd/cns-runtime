import { ApplicationError, Result } from "@js-soft/ts-utils";
import { Inject } from "typescript-ioc";
import { SharedItemDTO } from "../../..";
import {
    CreateSharedItemRequest,
    CreateSharedItemUseCase,
    DeleteSharedItemRequest,
    DeleteSharedItemUseCase,
    GetSharedItemRequest,
    GetSharedItemsByAddressRequest,
    GetSharedItemsByAddressUseCase,
    GetSharedItemsByReferenceRequest,
    GetSharedItemsByReferenceUseCase,
    GetSharedItemsRequest,
    GetSharedItemsSharedByAddressRequest,
    GetSharedItemsSharedByAddressUseCase,
    GetSharedItemsSharedWithAddressRequest,
    GetSharedItemsSharedWithAddressUseCase,
    GetSharedItemsUseCase,
    GetSharedItemUseCase,
    UpdateSharedItemRequest,
    UpdateSharedItemUseCase
} from "../../../useCases";

export class SharedItemsFacade {
    public constructor(
        @Inject private readonly createSharedItemUseCase: CreateSharedItemUseCase,
        @Inject private readonly deleteSharedItemUseCase: DeleteSharedItemUseCase,
        @Inject private readonly getSharedItemUseCase: GetSharedItemUseCase,
        @Inject private readonly getSharedItemsUseCase: GetSharedItemsUseCase,
        @Inject private readonly getSharedItemsByAddressUseCase: GetSharedItemsByAddressUseCase,
        @Inject private readonly getSharedItemsByReferenceUseCase: GetSharedItemsByReferenceUseCase,
        @Inject private readonly getSharedItemsSharedByAddressUseCase: GetSharedItemsSharedByAddressUseCase,
        @Inject private readonly getSharedItemsSharedWithAddressUseCase: GetSharedItemsSharedWithAddressUseCase,
        @Inject private readonly updateSharedItemUseCase: UpdateSharedItemUseCase
    ) {}

    public async createSharedItem(request: CreateSharedItemRequest): Promise<Result<SharedItemDTO, ApplicationError>> {
        return await this.createSharedItemUseCase.execute(request);
    }

    public async deleteSharedItem(request: DeleteSharedItemRequest): Promise<Result<void, ApplicationError>> {
        return await this.deleteSharedItemUseCase.execute(request);
    }

    public async getSharedItem(request: GetSharedItemRequest): Promise<Result<SharedItemDTO, ApplicationError>> {
        return await this.getSharedItemUseCase.execute(request);
    }

    public async getSharedItems(request: GetSharedItemsRequest): Promise<Result<SharedItemDTO[], ApplicationError>> {
        return await this.getSharedItemsUseCase.execute(request);
    }

    public async getSharedItemsByAddress(request: GetSharedItemsByAddressRequest): Promise<Result<SharedItemDTO[], ApplicationError>> {
        return await this.getSharedItemsByAddressUseCase.execute(request);
    }

    public async getSharedItemsByReference(request: GetSharedItemsByReferenceRequest): Promise<Result<SharedItemDTO[], ApplicationError>> {
        return await this.getSharedItemsByReferenceUseCase.execute(request);
    }

    public async getSharedItemsSharedByAddress(request: GetSharedItemsSharedByAddressRequest): Promise<Result<SharedItemDTO[], ApplicationError>> {
        return await this.getSharedItemsSharedByAddressUseCase.execute(request);
    }

    public async getSharedItemsSharedWithAddress(request: GetSharedItemsSharedWithAddressRequest): Promise<Result<SharedItemDTO[], ApplicationError>> {
        return await this.getSharedItemsSharedWithAddressUseCase.execute(request);
    }

    public async updateSharedItem(request: UpdateSharedItemRequest): Promise<Result<SharedItemDTO, ApplicationError>> {
        return await this.updateSharedItemUseCase.execute(request);
    }
}
