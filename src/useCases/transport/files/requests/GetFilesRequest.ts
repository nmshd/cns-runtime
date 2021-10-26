import { OwnerRestriction } from "../../../common";

export interface GetFilesRequest {
    query?: any;
    ownerRestriction?: OwnerRestriction;
}
