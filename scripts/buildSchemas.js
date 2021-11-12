const tsj = require("ts-json-schema-generator");
const fs = require("fs");
const path = require("path");
const glob = require("glob");

const config = {
    tsconfig: path.join(__dirname, "../tsconfig.json"),
    type: "*"
};

const requestTypes = glob
    .sync(path.join(__dirname, "../src/useCases/**/*.ts"))
    .map(path.parse)
    .map((p) => p.name)
    .map((name) => `${name}Request`);

const schemaGenerator = tsj.createGenerator(config);

const schemaDeclarations = requestTypes
    .map((type) => {
        try {
            const schema = schemaGenerator.createSchema(type);
            return `export const ${type} = ${JSON.stringify(schema, undefined, 4)}`;
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
