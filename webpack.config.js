const path = require("path");
const webpack = require("webpack");

module.exports = {
    mode: "development",
    node: {
        global: false
    },
    plugins: [],
    entry: {
        "nmshd.runtime": "./dist/index"
    },
    output: {
        path: path.resolve(__dirname, "lib-web"),
        filename: "[name].js",
        library: "NMSHDRuntime",
        umdNamedDefine: true
    },
    resolve: {
        extensions: [".js", ".json"],
        alias: {
            src: path.resolve(__dirname, "tmp-browser/src/")
        }
    },
    devtool: "source-map",
    externals: {
        lokijs: "loki",
        agentkeepalive: "NMSHDTransport",
        process: "NMSHDTransport",
        path: "NMSHDTransport",
        "fs-extra": "NMSHDTransport",
        fs: "NMSHDTransport",
        "@nmshd/consumption": "NMSHDConsumption",
        "@nmshd/content": "NMSHDContent",
        "@nmshd/transport": "NMSHDTransport",
        "@nmshd/node-logger": "NMSHDTransport",
        "@nmshd/crypto": "NMSHDCrypto",
        "@js-soft/ts-serval": "TSServal",
        "@js-soft/docdb-access-mongo": "TSServal"
    }
};
