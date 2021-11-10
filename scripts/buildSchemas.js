const tsj = require("ts-json-schema-generator");
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const config = {
    tsconfig: path.join(__dirname, "../tsconfig.json"),
    type: "*"
};

const requestTypes = glob
    .sync(path.join(__dirname, "../src/types/transport/requests/**/*.ts"))
    .map(path.parse)
    .map((p) => p.name);

const schemas = tsj.createGenerator(config);

const schemaDeclarations = requestTypes
    .map((type) => {
        const schema = schemas.createSchema(type);
        return `export const ${type} = ${JSON.stringify(schema, undefined, 4)}`;
    })
    .join("\n");

const output_path = path.join(__dirname, "../src/useCases/common/Schemas.ts");

fs.writeFile(output_path, schemaDeclarations, (err) => {
    if (err) throw err;
});
