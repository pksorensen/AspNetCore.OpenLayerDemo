

import * as ko from "knockout";
import { KoLayout } from "kolayout";
import * as NProgress from "nprogress";
import * as templateId from "template!./templates/rootlayout.html";
import * as ol from "openlayers";



let bridge = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            12.068717479705809,
                            55.81337587801879
                        ],
                        [
                            12.06768751144409,
                            55.813351764296634
                        ],
                        [
                            12.06620693206787,
                            55.81331559368536
                        ],
                        [
                            12.064919471740723,
                            55.813243252361936
                        ],
                        [
                            12.064018249511719,
                            55.81320708164982
                        ],
                        [
                            12.06292390823364,
                            55.81313474012471
                        ],
                        [
                            12.061765193939209,
                            55.81305034150881
                        ],
                        [
                            12.061100006103516,
                            55.81302622758494
                        ],
                        [
                            12.059812545776367,
                            55.81290565774145
                        ],
                        [
                            12.05822467803955,
                            55.81273685933307
                        ],
                        [
                            12.056100368499754,
                            55.81247160321216
                        ],
                        [
                            12.054641246795654,
                            55.81230280292122
                        ],
                        [
                            12.053139209747313,
                            55.81209783015511
                        ],
                        [
                            12.051658630371092,
                            55.811856684342395
                        ],
                        [
                            12.051122188568113,
                            55.81177228295494
                        ],
                        [
                            12.05120801925659,
                            55.811603479630996
                        ],
                        [
                            12.05174446105957,
                            55.811699938762914
                        ],
                        [
                            12.053203582763672,
                            55.81192902824308
                        ],
                        [
                            12.05472707748413,
                            55.81213400189816
                        ],
                        [
                            12.056143283843994,
                            55.81230280292122
                        ],
                        [
                            12.058310508728027,
                            55.812556003083095
                        ],
                        [
                            12.059855461120605,
                            55.81272480227586
                        ],
                        [
                            12.061164379119873,
                            55.81282125862876
                        ],
                        [
                            12.061851024627684,
                            55.81290565774145
                        ],
                        [
                            12.06296682357788,
                            55.81294182873371
                        ],
                        [
                            12.064082622528076,
                            55.81302622758494
                        ],
                        [
                            12.065026760101318,
                            55.81306239846514
                        ],
                        [
                            12.06622838973999,
                            55.81311062625315
                        ],
                        [
                            12.067730426788328,
                            55.813146797054905
                        ],
                        [
                            12.06873893737793,
                            55.813158853981356
                        ]
                    ]
                ]
            }
        }
    ]
}

export class RootLayout extends KoLayout {

   map = new ol.Map({
    view: new ol.View({
        center: [0, 0],
        zoom: 1
    }),
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    });
   _ol3d;
   _dataSource;

    constructor() {
        super({
            name: templateId,
            afterRender: async () => {
                NProgress.done();
                this.map.setTarget("map");


                let Cesium = await import("cesium");
                let olcs = await import("olcesium");


                console.log(olcs);
                var ol3d = this._ol3d = new olcs.OLCesium({ map: this.map }); // map is the ol.Map instance
                ol3d.enableAutoRenderLoop();
                ol3d.warmUp(0, 5000);
                var scene = ol3d.getCesiumScene();
                setTimeout(() => {
                    ol3d.setEnabled(true);
                }, 5000);
                let terrainProvider = new Cesium.CesiumTerrainProvider({
                    url: 'https://assets.agi.com/stk-terrain/world'
                });
                scene.terrainProvider = terrainProvider;
                scene.globe.depthTestAgainstTerrain = true;

                let datasources = ol3d.getDataSources();

                this._dataSource = new Cesium.CustomDataSource('myData');
                datasources.add(this._dataSource);

                let coords = bridge.features[0].geometry.coordinates[0];
                let height = 0;
                for (let c of coords) {
                    c.push(height);
                    height = Math.min(20, height + 5);
                }
                coords[coords.length - 1][2] = 0;
                coords[coords.length - 2][2] = 0;
                coords[coords.length - 3][2] = 5;
                coords[coords.length - 4][2] = 10;
                coords[coords.length - 5][2] = 15;
                coords[coords.length - 6][2] = 20;
                let c = Math.round(coords.length / 2-0.5);
 
                coords[c][2] = 0;
                coords[c-1][2] = 0;
              
          //      let flatten = [].concat.apply([], bridge.features[0].geometry.coordinates[0]);

                var positions = bridge.features[0].geometry.coordinates[0].map(c =>
                    Cesium.Cartographic.fromDegrees(c[0], c[1])
                );

                let heights = await Cesium.sampleTerrainMostDetailed(terrainProvider, positions);
                let coordinates1 = heights.map((m, i) => [bridge.features[0].geometry.coordinates[0][i][0], bridge.features[0].geometry.coordinates[0][i][1], m.height + bridge.features[0].geometry.coordinates[0][i][2]]);

                let flatten1 = [].concat.apply([], coordinates1);
                        
                                                                                                                  
                var orangePolygon = this._dataSource.entities.add({
                    name: 'Orange polygon with per-position heights and outline',
                    polygon: {
                        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(
                            flatten1),
                      //  extrudedHeight: 0,
                        perPositionHeight: true,
                        material: Cesium.Color.ORANGE.withAlpha(0.5),
                        outline: true,
                        outlineColor: Cesium.Color.BLACK
                    }
                });

            }
        })
    }
}





function getParameterByName(name, url?) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

let tasks: { [key: string]: Deferred } = {};

function generateUUID(): string {
    return ([1e7] as any + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
}


class Deferred {

    resolve;
    reject;
    promise = new Promise((resolve, reject) => { this.resolve = resolve; this.reject = reject });
}


function sendWebSocketEvent(connection: WebSocket, type: string, data: any) {
    let id = generateUUID();

    let task = {
        id: id,
        type: type,
        data: data,

    };
    let msg = JSON.stringify(task);
    if (msg.length > 65535) {
        console.log("Msg to large");
        let partId = 0;
        msg = JSON.stringify(data);

        while (msg.length > 0) {
            let lng = Math.min(msg.length, 48000);
            let b = JSON.stringify({
                id,
                type,
                partId,
                part: msg.substr(0, lng),
                last: msg.length === lng
            });
            console.log("sending " + b.length);
            connection.send(b);
            msg = msg.substr(lng);
        }


    } else {
        connection.send(msg);
    }

    tasks[id] = new Deferred();
    return tasks[id].promise;
}
async function  main(config, connection) {

    console.log("main called");
    ko.applyBindings(new RootLayout());

    setTimeout(async () => {

        await sendWebSocketEvent(connection, "PAGE_RENDER", {path:"test.jpg"});
        await sendWebSocketEvent(connection, "COMPLETE", { hello: "world" });

    }, 10000);
}


if (getParameterByName("headless")) {

    console.log("Running In Headless");
     
    let connection = new WebSocket('ws://127.0.0.1:1337');

    connection.onopen = function () {
        // connection is opened and ready to use
        console.log("Connection Opened");

        define("main", ["module", "es6-promise"], (module, es6promise) => { console.log(Object.keys(es6promise).join(" ")); es6promise.polyfill(); main(module.config(), connection); });
      
        requirejs.config({
            paths: {
                "es6-promise": "/libs/es6-promise/es6-promise.min"
            }
        });

        connection.send(JSON.stringify({
            type: "LOADED",
            dependencies: { "es6-promise": "es6-promise/dist" }
        }));
    };

    connection.onerror = function (error) {
        console.log("FAILED TO OPEN SOCKET");
        // an error occurred when sending/receiving data
    };

    connection.onmessage = function (message) {
        // try to decode json (I assume that each message from server is json)
        try {
            var json = JSON.parse(message.data);
            if (json.id in tasks) {
                tasks[json.id].resolve(json.data);
            }
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
        // handle incoming message
    };
} else {
    //RUNNING IN NORMAL BROWSER
    ko.applyBindings(new RootLayout());
}
