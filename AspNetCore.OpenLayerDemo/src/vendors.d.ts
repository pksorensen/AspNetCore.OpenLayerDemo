declare module "template!*" {
    let b: string;
    export =b;
}

declare module "cesium";
declare module "olcesium";

declare function define(string: "main", deps: Array<string>, callback: any);

interface NodeRequire {
    config(c: any);
}
declare var requirejs;