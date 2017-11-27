
define("olcesium", ["cesium", "olcesium-lib"], function () {
    return olcs;
});
define("openlayers", ["olcesium-lib"], function () {
    return ol;
});

require.config({
    shim: {
        "cesium": {
            exports: "Cesium"
        },
        "olcesium-lib": {
            deps: ["proj4", "css!/libs/olcesium/ol.css"],
        },
    },
    paths: {
        "css": "/libs/requirejs/css",
        "text": "/libs/requirejs/text",
        "domReady": "/libs/requirejs/ready",
        "modernizr": "/libs/modernizr/modernizr",
        "nprogress": "/libs/nprogress/nprogress",
        "knockout": ["//cdnjs.cloudflare.com/ajax/libs/knockout/3.4.2/knockout-min", "/libs/knockout/knockout-latest"],
        "template": "/libs/kolayout/src/template",
        "stringTemplateEngine": "/libs/kolayout/src/stringTemplateEngine",
        "c3": "/libs/c3/c3.min",
        "d3": "/libs/c3/d3.min",
        "draggabilly": "/libs/draggabilly/draggabilly.pkgd.min",
        "typestyle": "/libs/typestyle/typestyle.min",
        "rbush": "/libs/rbush/rbush.min",
        "css-builder": "/libs/css-builder/css-builder",
        "normalize": "/libs/css-builder/normalize",
        "oidc-client": ["//cdnjs.cloudflare.com/ajax/libs/oidc-client/1.3.0/oidc-client.min", "/libs/oidc-client/oidc-client.min"],
        "animejs": "/libs/animejs/anime.min",
        "react": "/libs/react/react.min",
        "react-dom": "/libs/react/react-dom.min",
        "flexboxgrid": "/libs/flexboxgrid",
        "pako": "/libs/pako/pako.min",
        "ResizeSensor": "/libs/resizesensor/ResizeSensor",
        "proj4": "/libs/proj4/proj4",
        "si-appbuilder-application-insights-middleware": "/libs/si-appbuilder-application-insights-middleware/ApplicationInsightsMiddleware",
        "si-appbuilder-oidcmiddleware": "/libs/si-appbuilder-oidcmiddleware/OidcMiddleware",
        "olcesium-lib": "/libs/olcesium/olcesium",
        "cesium": "/libs/cesium/cesium"
    },
    packages: [

        {
            name: "kolayout",
            location: "/libs/kolayout/src",
            main: "index"
        },
        {
            name: "si-appbuilder",
            location: "/libs/si-appbuilder",
            main: "index"
        },
        {
            name: "Demos/Fjordbroen",
            location: "/src/demos/fjordbroen",
            main: "index"
        },
        {
            name: "Demos/TrackUnit",
            location: "/src/demos/TrackUnit",
            main: "index"
        },
        {
            name: "Demos/Hus",
            location: "/src/demos/Hus",
            main: "index"
        },
    ]
})