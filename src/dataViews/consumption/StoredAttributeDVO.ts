import { ConsumptionAttributeDVO } from "../content/ConsumptionAttributeDVO";

export interface StoredAttributeDVO extends Omit<ConsumptionAttributeDVO, "type"> {
    type: "StoredAttributeDVO";
    sharedItems: string[];
    sharedItemCount: number;
}
