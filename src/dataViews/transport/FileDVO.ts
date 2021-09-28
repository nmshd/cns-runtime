import { FileDTO } from "../../types";
import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "./IdentityDVO";

export interface FileDVOProperties extends FileDTO {
    createdByObject: IdentityDVO;
}

export interface FileDVO extends DataViewObject {
    file: FileDVOProperties;
}
