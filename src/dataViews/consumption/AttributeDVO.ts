import { AttributeJSON } from "@nmshd/content";
import { ConsumptionAttributeDTO } from "../../types";
import { DataViewObject } from "../DataViewObject";

export interface UnavailableAttributeDVOProperties {
    content: {
        name: string;
    };
    isAvailable: false;
}

export interface AttributeDVOProperties extends AttributeJSON {
    isAvailable: false;
}

export interface AvailableAttributeDVOProperties extends ConsumptionAttributeDTO {
    isAvailable: true;
}

export interface AttributeDVO extends DataViewObject {
    attribute: AttributeDVOProperties | UnavailableAttributeDVOProperties | AvailableAttributeDVOProperties;
}
