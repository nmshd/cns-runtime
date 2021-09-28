import { SharedItem } from "@nmshd/consumption";
import { SharedItemDTO } from "../../../types";

export class SharedItemsMapper {
    public static toSharedItemDTO(sharedItem: SharedItem): SharedItemDTO {
        return {
            id: sharedItem.id.toString(),
            tags: sharedItem.tags,
            sharedBy: sharedItem.sharedBy.toString(),
            sharedWith: sharedItem.sharedWith.toString(),
            sharedAt: sharedItem.sharedAt.toString(),
            reference: sharedItem.reference?.toString(),
            content: sharedItem.content.toJSON(),
            succeedsItem: sharedItem.succeedsItem?.toString(),
            succeedsAt: sharedItem.succeedsAt?.toString(),
            expiresAt: sharedItem.expiresAt?.toString()
        };
    }

    public static toSharedItemDTOList(sharedItems: SharedItem[]): SharedItemDTO[] {
        return sharedItems.map((s) => this.toSharedItemDTO(s));
    }
}
