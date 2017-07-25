/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/reflect-metadata/reflect-metadata.d.ts" />

declare module '*.html' {
  var _: string;
  export default  _;
}

declare module '*.css' {
  var _: string;
  export default  _;
}
