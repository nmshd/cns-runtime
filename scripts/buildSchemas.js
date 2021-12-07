const tsj = require("ts-json-schema-generator");
const fs = require("fs");
const path = require("path");

const config = {
    tsconfig: path.join(__dirname, "../tsconfig.json"),
    type: "*",
    extraTags: ["errorMessage"]
};

const schemaGenerator = tsj.createGenerator(config);

const requestTypes = schemaGenerator
    .getRootNodes()
    .map((x) => x.symbol.escapedName)
    .filter((x) => x.endsWith("Request"));

const schemaDeclarations = requestTypes
    .map((type) => {
        try {
            const schema = schemaGenerator.createSchema(type);
            return `export const ${type}: any = ${JSON.stringify(schema, undefined, 4)}`;
        } catch (e) {
            if (!(e instanceof tsj.NoRootTypeError)) throw e;
        }
    })
    .filter((s) => s)
    .join("\n\n");

const output_path = path.join(__dirname, "../src/useCases/common/Schemas.ts");

fs.writeFile(output_path, schemaDeclarations, (err) => {
    if (err) throw err;
});
