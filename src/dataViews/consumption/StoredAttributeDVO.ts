import { AttributeDVOInternal } from "../content/AttributeDVO";

export interface StoredAttributeDVO extends AttributeDVOInternal {
    type: "StoredAttributeDVO";
    sharedItems: string[];
    sharedItemCount: number;
}
