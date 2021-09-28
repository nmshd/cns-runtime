import { Error } from "./common/Error";
import { Warning } from "./common/Warning";

export interface DataViewObject {
    id: string;
    name: string;
    description?: string;
    image?: string;
    type: string;
    date?: string;
    items?: DataViewObject[];

    errorCount?: number;
    errors?: Error[];

    warningCount?: number;
    warnings?: Warning[];
}
