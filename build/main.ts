import * as path from "path";
import * as cli from "build-utils/cli";
import {exec} from "build-utils/process";
import {mergeConfig, updateConfig} from "build-utils/config";
import {copyGlob, deleteDirectory, readFile, readJSONFile, writeFile, writeJSONFile} from "build-utils/fs";
import "tslib";
import * as rollup from "rollup";
import rollupConfig from "./rollup.config";
import * as colors from "colors/safe";

const MODULE_NAME = "t-count";

cli.command("pack", pack);
cli.command("patch", patch);
cli.command("patchError", patchError);
cli.run();

export async function patch() {
    await pack();

    await exec("npm version patch", {
        cwd: "./package",
    });

    await exec("npm publish", {
        cwd: "./package",
    });

    const {version} = await readJSONFile("./package/package.json");
    await updateConfig("./package.json", {
        version: version,
    });
}

async function pack() {
    console.log("Creating npm package");

    await deleteDirectory("./build_tmp");
    await deleteDirectory("./package");

    await mergeConfig("./tsconfig.json", "./build/tsconfig.pack.json", "./tsconfig.tmp.json");

    await exec(path.resolve("node_modules/.bin/tsc") + " -p ./tsconfig.tmp.json");

    await copyGlob("./src/**/*.html", "./build_tmp/src");
    await copyGlob("./src/**/*.scss", "./build_tmp/src");

    await bundle();

    await copyGlob("./build_tmp/src/**/*.d.ts", "./package");

    await createPackageJson();
}

async function bundle() {
    const bundle = await rollup.rollup(rollupConfig);


    await bundle.write({
        format: 'umd',
        moduleName: MODULE_NAME,
        dest: `package/${MODULE_NAME}.umd.js`
    });

    await bundle.write({
        format: 'es',
        moduleName: MODULE_NAME,
        dest: `package/${MODULE_NAME}.es5.js`
    });
}

async function createPackageJson() {
    const json = await readJSONFile("./package.json");

    json.devDependencies = {};
    json.peerDependencies = json.dependencies;
    json.dependencies = {};

    await writeJSONFile("package/package.json", json);
}

function patchError() {
    console.error(colors.red("ERROR: Publish to local artificatory cannot be executed using npm commands. Please run the following command \"node_modules\\.bin\\bu patch\""));
}