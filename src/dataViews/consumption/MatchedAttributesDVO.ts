import { DataViewObject } from "../DataViewObject";
import { StoredAttributeDVO } from "./StoredAttributeDVO";

export interface MatchedAttributesDVO extends DataViewObject {
    type: "MatchedAttributesDVO";
    // query: AttributeMetadata;
    matches: StoredAttributeDVO[];
    matchCount: number;
    bestMatch?: StoredAttributeDVO;
    // fallback: AttributeDVO;
}
