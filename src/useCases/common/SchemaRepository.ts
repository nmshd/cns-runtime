import Ajv, { ErrorObject, ValidateFunction } from "ajv";
import addErrors from "ajv-errors";
import addFormats from "ajv-formats";
import { Definition } from "ts-json-schema-generator";

const customFormats: Record<string, string> = {
    fileId: "FIL[A-Za-z0-9]{17}",
    relationshipId: "REL[A-Za-z0-9]{17}",
    messageId: "MSG[A-Za-z0-9]{17}",
    relationshipTemplateId: "RLT[A-Za-z0-9]{17}",
    tokenId: "TOK[A-Za-z0-9]{17}",
    relationshipChangeId: "RCH[A-Za-z0-9]{17}",
    deviceId: "DVC[A-Za-z0-9]{17}"
};

export class SchemaRepository {
    private readonly compiler: Ajv;
    private schemaDefinitions: Record<string, Definition | undefined>;
    private readonly jsonSchemas = new Map<string, JsonSchema>();

    public constructor() {
        this.compiler = new Ajv({allErrors: true});
        addFormats(this.compiler);
        addErrors(this.compiler)

        this.addCustomFormats();
    }

    private addCustomFormats() {
        Object.entries(customFormats).forEach(([name, format]) => {
            this.compiler.addFormat(name, format);
        });
    }

    public async loadSchemas(): Promise<void> {
        this.schemaDefinitions = (await import("./Schemas")) as Record<string, Definition>;
    }

    public getSchema(schemaName: string): JsonSchema {
        if (!this.jsonSchemas.has(schemaName)) {
            this.jsonSchemas.set(schemaName, new JsonSchema(this.getValidationFunction(schemaName)));
        }

        return this.jsonSchemas.get(schemaName)!;
    }

    private getValidationFunction(schemaName: string): ValidateFunction {
        return this.compiler.compile(this.getSchemaDefinition(schemaName));
    }

    private getSchemaDefinition(type: string): Definition {
        const def = this.schemaDefinitions[type];

        if (!def) throw new Error(`Schema ${type} not found`);

        return def;
    }
}

export type JsonSchemaValidationResult = { isValid: boolean; errors: null | ErrorObject[] | undefined };

export class JsonSchema {
    public constructor(private readonly validateSchema: ValidateFunction) {}

    public validate(obj: any): JsonSchemaValidationResult {
        return { isValid: this.validateSchema(obj), errors: this.validateSchema.errors };
    }
}
