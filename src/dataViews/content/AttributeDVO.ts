import { DataViewObject } from "../DataViewObject";

export interface AttributeMetadata {
    key?: string;
    tags?: string[];
    validFrom?: string;
    validTo?: string;
    label?: string;
    dataType?: string;
}

export interface AttributeDVOInternal extends DataViewObject {
    value?: any;
    // metadata: AttributeMetadata;
    isOwn: boolean;
    // sharedItems?: string;
}

export interface AttributeDVO extends AttributeDVOInternal {
    type: "AttributeDVO";
}
