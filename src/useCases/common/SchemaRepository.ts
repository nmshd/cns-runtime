import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { join as joinPath } from "path";
import { createGenerator, Definition, SchemaGenerator } from "ts-json-schema-generator";

const config = {
    // The path seems to get ignored by ts-json-schema-generator (although it shouldn't be according to the documentation)
    // it instead parses the entire project (from tsconfig) which is a bit slow at startup.
    // Even without glob pattern it is ignored.
    path: joinPath(__dirname, "../../types/transport/requests/files/GetFile.ts"),
    tsconfig: joinPath(__dirname, "../../../tsconfig.json"),
    type: "*"
};

const customFormats: Array<Array<string>> = [
    ["bkb-file", "FIL[A-Za-z0-9]{17}"],
    ["bkb-relationship", "REL[A-Za-z0-9]{17}"],
    ["bkb-relationshipRequest", "RRQ[A-Za-z0-9]{17}"],
    ["bkb-message", "MSG[A-Za-z0-9]{17}"],
    ["bkb-relationshipTemplate", "RLT[A-Za-z0-9]{17}"],
    ["bkb-token", "TOK[A-Za-z0-9]{17}"],
    ["bkb-relationshipChange", "RCH[A-Za-z0-9]{17}"],
    ["bkb-device", "DVC[A-Za-z0-9]{17}"]
];

export class SchemaRepository {
    private generator: SchemaGenerator;
    private compiler: Ajv;

    constructor() {
        this.generator = createGenerator(config);
        this.compiler = new Ajv();
        addFormats(this.compiler);

        this.addCustomFormats();
    }

    private addCustomFormats() {
        customFormats.forEach(([name, format]) => {
            this.compiler.addFormat(name, format);
        });
    }

    public getSchema(type: string): Definition {
        return this.generator.createSchema(type);
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
