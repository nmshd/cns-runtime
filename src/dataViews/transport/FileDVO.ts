import { DataViewObject } from "../DataViewObject";
import { IdentityDVO } from "./IdentityDVO";

export interface FileDVO extends DataViewObject {
    type: "FileDVO";
    filename: string;
    filesize: number;
    createdAt: string;
    createdBy: IdentityDVO;
    createdByDevice: string;
    expiresAt: string;
    mimetype: string;
    isOwn: boolean;
    title: string;
    secretKey: string;
    description?: string;
    deletedAt?: string;
    deletedBy?: IdentityDVO;
    deletedByDevice?: string;
}
