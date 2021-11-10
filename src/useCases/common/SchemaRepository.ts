import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { Definition } from "ts-json-schema-generator";
import * as schemas from "./Schemas";

const customFormats: Record<string, string> = {
    "bkb-file": "FIL[A-Za-z0-9]{17}",
    "bkb-relationship": "REL[A-Za-z0-9]{17}",
    "bkb-relationshipRequest": "RRQ[A-Za-z0-9]{17}",
    "bkb-message": "MSG[A-Za-z0-9]{17}",
    "bkb-relationshipTemplate": "RLT[A-Za-z0-9]{17}",
    "bkb-token": "TOK[A-Za-z0-9]{17}",
    "bkb-relationshipChange": "RCH[A-Za-z0-9]{17}",
    "bkb-device": "DVC[A-Za-z0-9]{17}"
};

export class SchemaRepository {
    private readonly compiler: Ajv;

    public constructor() {
        this.compiler = new Ajv();
        addFormats(this.compiler);

        this.addCustomFormats();
    }

    private addCustomFormats() {
        Object.entries(customFormats).forEach(([name, format]) => {
            this.compiler.addFormat(name, format);
        });
    }

    public getSchema(type: string): Definition {
        // eslint-disable-next-line
        // @ts-ignore
        return schemas[type];
    }

    public getValidationFunction(schemaOrString: Definition | string): ValidateFunction {
        let schema: Definition;

        if (typeof schemaOrString === "string") {
            schema = this.getSchema(schemaOrString);
        } else {
            schema = schemaOrString;
        }

        return this.compiler.compile(schema);
    }
}
