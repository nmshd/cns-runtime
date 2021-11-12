import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { Definition } from "ts-json-schema-generator";

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
    private schemaDefinitions: Record<string, Definition>;
    private jsonSchemas = new Map<string, JsonSchema>();

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

    public async loadSchemas(): Promise<void> {
        this.schemaDefinitions = (await import("./Schemas")) as Record<string, Definition>;
    }

    public getJsonSchema(schemaName: string): JsonSchema {
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

export class JsonSchema {
    public constructor(private validateSchema: ValidateFunction) {}

    public validate(obj: any) {
        return { isValid: this.validateSchema(obj), errors: this.validateSchema.errors };
    }
}
