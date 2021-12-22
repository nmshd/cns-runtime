import { DataViewObject } from "../DataViewObject";
import { StoredAttributeDVO } from "./StoredAttributeDVO";

export interface MatchedAttributesDVO extends DataViewObject {
    type: "MatchedAttributesDVO";
    // query: AttributeMetadata;
    matches: StoredAttributeDVO[];
    bestMatch?: StoredAttributeDVO;
    // fallback: AttributeDVO;
}
