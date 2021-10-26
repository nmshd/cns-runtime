import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { join as joinPath } from "path";
import { createGenerator, Definition, SchemaGenerator } from "ts-json-schema-generator";

const config = {
    path: joinPath(__dirname, "../transport/requests/*.ts"),
    tsconfig: joinPath(__dirname, "../../../tsconfig.json"),
    type: "*"
};

export class SchemaRepository {
    private generator: SchemaGenerator;
    private compiler: Ajv;

    constructor() {
        console.log(config.path, config.tsconfig);
        this.generator = createGenerator(config);
        this.compiler = new Ajv();
        addFormats(this.compiler);
    }

    public getSchema(type: string): Definition {
        return this.generator.createSchema(type);
    }

    public getValidationFunction(schema: Definition): ValidateFunction {
        return this.compiler.compile(schema);
    }
}
