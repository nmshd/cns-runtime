import { AttributeDVO } from "../content/AttributeDVO";

export interface StoredAttributeDVO extends Omit<AttributeDVO, "type"> {
    type: "StoredAttributeDVO";
    sharedItems: string[];
    sharedItemCount: number;
}
