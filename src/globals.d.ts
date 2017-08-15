/// <reference path="../node_modules/zone.js/dist/zone.js.d.ts" />

declare module "*.html" {
    var value: string;
    export default  value;
}

declare module "rollup";
declare module "colors/safe";
declare module "rollup-plugin-postcss";
declare module "rollup-plugin-sass";
declare module "rollup-plugin-string";
