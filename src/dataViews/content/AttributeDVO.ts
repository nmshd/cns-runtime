import { DataViewObject } from "../DataViewObject";

export interface AttributeMetadata {
    key?: string;
    tags?: string[];
    validFrom?: string;
    validTo?: string;
    label?: string;
    dataType?: string;
}

export interface AttributeDVO extends DataViewObject {
    type: "AttributeDVO";

    value?: any;
    // metadata: AttributeMetadata;
    isOwn: boolean;
    // sharedItems?: string;
}
