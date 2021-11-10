import { OwnerRestriction } from "../../../../useCases/common";

export interface GetFilesRequest {
    query?: any;
    ownerRestriction?: OwnerRestriction;
}
