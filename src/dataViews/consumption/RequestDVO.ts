import { RequestJSON } from "@nmshd/content";
import { DataViewObject } from "../DataViewObject";

export interface RequestDVOProperties extends RequestJSON {}

export interface RequestDVO extends DataViewObject {
    request: RequestDVOProperties;
}
