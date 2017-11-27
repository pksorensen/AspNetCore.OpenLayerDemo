

import * as ko from "knockout";
import { KoLayout } from "kolayout";
import * as NProgress from "nprogress";
import * as templateId from "template!./templates/rootlayout.html";
import * as ol from "openlayers";


 
import * as proj4 from "proj4";

ol.proj.setProj4(proj4);

export function createLocalProjection(projkey: string, center_wgs84: number[], buffer_meter: number) {
    proj4.defs(projkey, `+proj=tmerc +lat_0=${center_wgs84[1]} +lon_0=${center_wgs84[0]} +x_0=0 +y_0=0 +towgs84=0,0,0,0,0,0,0 +units=m +vunits=m +no_defs`);


    var newProj = ol.proj.get(projkey);
    var fromLonLat = ol.proj.getTransform('EPSG:4326', newProj);
    let center = fromLonLat(center_wgs84);
    let extent = [center[0] - buffer_meter, center[1] - buffer_meter, center[0] + buffer_meter, center[1] + buffer_meter] as ol.Extent;
    newProj.setExtent(extent);

    return newProj;
}


export function _extend(point: ol.Coordinate, angle: number, length: number): ol.Coordinate {

    let x = point[0] + length * Math.cos(angle * Math.PI / 180);
    let y = point[1] + length * Math.sin(angle * Math.PI / 180);


    return [x,y];
}

export class PathBuilder {

    public path = [] as Array<ol.Coordinate>;
    public heights = [] as Array<number>;
    constructor(private _origin: ol.Coordinate = [0, 0]) {
        this.path.push(_origin);
    }

    get lastCoordinate() {
        return this.path[this.path.length - 1];
    }

    extend(angle: number, length: number) {
        this.path.push(_extend(this.lastCoordinate, angle, length));
        return this;
    }

    close() {
        this.path.push(this.path[0].slice(0) as ol.Coordinate);
        return this;
    }

    toPolygon() {
        return [this.path];
    }
    withHeight(height: number) {
           this.lastCoordinate.push(height);
        this.heights.push(height)
        return this;
    }

    rotate(angle: number) {
        for (let n = 0; n < this.path.length; n++) {
            let xy = rotate(0, 0, this.path[n][0], this.path[n][1], angle);
            this.path[n][0] = xy[0];
            this.path[n][1] = xy[1];

        }

        return this;
    }
   

}

function rotate(cx, cy, x, y, angle) {
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}

function createWindowParti(Cesium, _dataSource, start, localproj,h1,angle) {
    for (let j = 0; j < 6; j++) {

        var window1 = new PathBuilder([start[0] - j - 0.02, start[1]])
            .extend(180, 0.96).rotate(angle);
        let doorol = new ol.geom.Polygon(window1.toPolygon());
        doorol.transform(localproj, "EPSG:4326");
        let doorcoordinate = [].concat.apply([], doorol.getCoordinates()[0]);

        let door1Wall = _dataSource.entities.add({

            wall: {
                positions: Cesium.Cartesian3.fromDegreesArray(doorcoordinate),
                minimumHeights: [0.02, 0.02],
                maximumHeights: [1.98, 1.98],
                material: Cesium.Color.LIGHTCYAN.withAlpha(0.95),
                outline: true,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 10
            }
        });
    }
    for (let j = 0; j < 6; j++) {
        var window1 = new PathBuilder([start[0] - j - 0.02, start[1]])
            .extend(180, 0.96).rotate(angle);
        let doorol = new ol.geom.Polygon(window1.toPolygon());
        doorol.transform(localproj, "EPSG:4326");
        let doorcoordinate = [].concat.apply([], doorol.getCoordinates()[0]);

        let door1Wall = _dataSource.entities.add({

            wall: {
                positions: Cesium.Cartesian3.fromDegreesArray(doorcoordinate),
                minimumHeights: [2.02, 2.02],
                maximumHeights: [3.98, 3.98],
                material: Cesium.Color.LIGHTCYAN.withAlpha(0.95),
                outline: true,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 10
            }
        });
    }
    for (let j = 0; j < 6; j++) {

        var window1 = new PathBuilder([start[0] - j - 0.02, start[1]])
            .extend(180, 0.96).rotate(angle);
        let doorol = new ol.geom.Polygon(window1.toPolygon());
        doorol.transform(localproj, "EPSG:4326");
        let doorcoordinate = [].concat.apply([], doorol.getCoordinates()[0]);

        let door1Wall = _dataSource.entities.add({

            wall: {
                positions: Cesium.Cartesian3.fromDegreesArray(doorcoordinate),
                minimumHeights: [4.02, 4.02],
                maximumHeights: j < 3 ?
                    [h1 + Math.tan(20 / 180 * Math.PI) * j, h1 + Math.tan(20 / 180 * Math.PI) * (j + 1)] :
                    [h1 + Math.tan(20 / 180 * Math.PI) * (6 - j), h1 + Math.tan(20 / 180 * Math.PI) * (6 - j - 1)],
                material: Cesium.Color.LIGHTCYAN.withAlpha(0.95),
                outline: true,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 10
            }
        });
    }
}

function AddGlass(Cesium, _dataSource,start: ol.Coordinate,n: number,localproj,h1,h2,angle,dx=1) {
    for (let j = 0; j < n; j++) {

        var window1 = new PathBuilder([start[0], start[1] + j * dx])
            .extend(dx === 1 ? 90 : 270, 0.96).rotate(angle);
        let doorol = new ol.geom.Polygon(window1.toPolygon());
        doorol.transform(localproj, "EPSG:4326");
        let doorcoordinate = [].concat.apply([], doorol.getCoordinates()[0]);

        let door1Wall = _dataSource.entities.add({

            wall: {
                positions: Cesium.Cartesian3.fromDegreesArray(doorcoordinate),
                minimumHeights: [h1, h1],
                maximumHeights: [h2, h2],
                material: Cesium.Color.LIGHTCYAN.withAlpha(0.95),
                outline: true,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 10
            }
        });
    }
}
function addWindow(Cesium, localproj, _dataSource,start, direction,width, h1,h2, angle) {
    var window1 = new PathBuilder(start)
        .extend(direction, width).rotate(angle);
    let doorol = new ol.geom.Polygon(window1.toPolygon());
    doorol.transform(localproj, "EPSG:4326");
    let doorcoordinate = [].concat.apply([], doorol.getCoordinates()[0]);

    let door1Wall = _dataSource.entities.add({

        wall: {
            positions: Cesium.Cartesian3.fromDegreesArray(doorcoordinate),
            minimumHeights: [h1, h1],
            maximumHeights: [h2, h2],
            material: Cesium.Color.LIGHTCYAN.withAlpha(0.95),
            outline: true,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 10
        }
    });
}
function addGarageDoor(Cesium, localproj,_dataSource,start,angle) {
    var window1 = new PathBuilder(start)
        .extend(90, 1).rotate(angle);
    let doorol = new ol.geom.Polygon(window1.toPolygon());
    doorol.transform(localproj, "EPSG:4326");
    let doorcoordinate = [].concat.apply([], doorol.getCoordinates()[0]);

    let door1Wall = _dataSource.entities.add({

        wall: {
            positions: Cesium.Cartesian3.fromDegreesArray(doorcoordinate),
            minimumHeights: [0, 0],
            maximumHeights: [2, 2],
            material: Cesium.Color.BLACK.withAlpha(0.95),
            outline: true,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 10
        }
    });
}

function addGarageDoubleDoor(Cesium, localproj, _dataSource, start, angle) {
    var window1 = new PathBuilder(start)
        .extend(180, 2.4).rotate(angle);
    let doorol = new ol.geom.Polygon(window1.toPolygon());
    doorol.transform(localproj, "EPSG:4326");
    let doorcoordinate = [].concat.apply([], doorol.getCoordinates()[0]);

    let door1Wall = _dataSource.entities.add({

        wall: {
            positions: Cesium.Cartesian3.fromDegreesArray(doorcoordinate),
            minimumHeights: [0, 0],
            maximumHeights: [2, 2],
            material: Cesium.Color.BLACK.withAlpha(0.95),
            outline: true,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 10
        }
    });
}

export class RootLayout extends KoLayout {

   map = new ol.Map({
    view: new ol.View({
        center: [0, 0],
        zoom: 1
    }),
    layers: [
        new ol.layer.Tile({
            source: new ol.source.BingMaps({
                imagerySet: "Aerial", maxZoom:19,
                key:"AnODUgL-0Aq7FnNCkGW2scdOPN9xaePBMpvWK6PWiCaCjqFp1om47So4l8zsq6cX" })
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


                let flag1 = (getParameterByName("flag1") || "false").toLowerCase() === "true";
                var flag2 = (getParameterByName("flag2") || "false").toLowerCase() === "true";;

                let Cesium = await import("cesium");
                let olcs = await import("olcesium");


                console.log(olcs);
                var ol3d = this._ol3d = new olcs.OLCesium({ map: this.map }); // map is the ol.Map instance
                ol3d.enableAutoRenderLoop();
                ol3d.warmUp(0, 5000);
                var scene = ol3d.getCesiumScene();

                var localproj = createLocalProjection("test", [11.411393, 55.361990], 20000);
                let angle = 95;
                setTimeout(() => {
                    this.map.getView().fit(new ol.geom.Point(ol.proj.fromLonLat([11.411173, 55.362267])), { minResolution: 10, });
                    ol3d.setEnabled(true);

                }, 500);


                var path = new PathBuilder().withHeight(2.6)
                    .extend(180, 6.5).withHeight(2.6 + (3.3 + 0.65 + 2.5) * Math.tan(20 / 180 * Math.PI))
                    .extend(90, 7 - 1.5).withHeight(2.6 + (3.3 + 0.65 + 2.5) * Math.tan(20 / 180 * Math.PI))
                    .extend(180, 1.5).withHeight(2.6 + (3.3 + 0.65 + 2.5) * Math.tan(20 / 180 * Math.PI) + (1.5) * Math.tan(20 / 180 * Math.PI))
                    .extend(270, 7 - 1.5).withHeight(2.6 + (3.3 + 0.65 + 2.5) * Math.tan(20 / 180 * Math.PI) + (1.5) * Math.tan(20 / 180 * Math.PI))
                    .extend(180, 3).withHeight(2.6 + (3.3 + 0.65 + 2.5) * Math.tan(20 / 180 * Math.PI) + (1.5) * Math.tan(20 / 180 * Math.PI) + (3) * Math.tan(20 / 180 * Math.PI))
                    .extend(180, 3).withHeight(2.6 + (3.3 + 0.65 + 2.5) * Math.tan(20 / 180 * Math.PI) + (1.5) * Math.tan(20 / 180 * Math.PI));

                if (flag2) {
                    path.extend(90, 1.5).withHeight(2.6 + (3.3 + 0.65 + 2.5) * Math.tan(20 / 180 * Math.PI) + (1.5) * Math.tan(20 / 180 * Math.PI))
                        .extend(180, 4 + 0.65 + 3.35).withHeight(2.6);

                } else {
                    if (flag1) {
                        path.extend(180, 0.65).withHeight(2.6 + (3.3 + 2.5) * Math.tan(20 / 180 * Math.PI) + (1.5) * Math.tan(20 / 180 * Math.PI))
                            .extend(90, 7 - 2 - 2.5).withHeight(2.6 + (3.3 + 2.5) * Math.tan(20 / 180 * Math.PI) + (1.5) * Math.tan(20 / 180 * Math.PI))
                            .extend(180, 3.35).withHeight(2.6 + (4) * Math.tan(20 / 180 * Math.PI))
                            .extend(270, 7 - 2 - 2.5).withHeight(2.6 + (4) * Math.tan(20 / 180 * Math.PI))
                            .extend(180, 4).withHeight(2.6)
                    } else {
                        path.extend(180, 4 + 0.65 + 3.35).withHeight(2.6)
                    }
                }

                path.extend(90, 3.5).withHeight(2.6)
                    .extend(180, 6).withHeight(2.6)
                    .extend(90, 5).withHeight(2.6)
                    .extend(0, 6).withHeight(2.6)
                    .extend(90, 2).withHeight(2.6)


                    //  path.extend(90, 5 + 2 + 4.5 + 0.5 + (flag2 ? -1.5 : 0)).withHeight(2.6)
                    .extend(0, 8).withHeight(2.6 + (8) * Math.tan(20 / 180 * Math.PI))
                    .extend(90, 2).withHeight(2.6 + (8) * Math.tan(20 / 180 * Math.PI))
                    .extend(0, 3).withHeight(2.6 + (11) * Math.tan(20 / 180 * Math.PI))
                    .extend(0, 3).withHeight(2.6 + (8) * Math.tan(20 / 180 * Math.PI))
                    .extend(270, 2).withHeight(2.6 + (8) * Math.tan(20 / 180 * Math.PI))
                    .extend(0, 7).withHeight(2.6 + (1) * Math.tan(20 / 180 * Math.PI))
                    .extend(270, 5).withHeight(2.6 + (1) * Math.tan(20 / 180 * Math.PI))
                    .extend(0, 1).withHeight(2.6)
                    .close().withHeight(2.6).rotate(angle);


                var polygon = new ol.geom.Polygon(path.toPolygon());
                polygon.transform(localproj, "EPSG:4326");

                var door1 = new PathBuilder([-4 - 0.25, -0.01]).withHeight(2.4)
                    .extend(180, 0.99).withHeight(2.4).close().withHeight(2).rotate(angle);
                var door2 = new PathBuilder([-4 - 0.25 - 1.01, -0.01]).withHeight(2.4)
                    .extend(180, 0.99).withHeight(2.4).rotate(angle);





                //  let terrainProvider = new Cesium.CesiumTerrainProvider({
                //       url: 'https://assets.agi.com/stk-terrain/world'
                //  });
                // scene.terrainProvider = terrainProvider;
                // scene.globe.depthTestAgainstTerrain = true;

                let datasources = ol3d.getDataSources();

                this._dataSource = new Cesium.CustomDataSource('myData');
                datasources.add(this._dataSource);



                //var orangePolygon = this._dataSource.entities.add({
                //    name: 'Orange polygon with per-position heights and outline',
                //    polygon: {
                //        hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(
                //            flatten1),
                //          extrudedHeight: 0,
                //        perPositionHeight: true,
                //        material: material, //Cesium.Color.ORANGE.withAlpha(0.5),
                //        outline: true,
                //        outlineColor: Cesium.Color.BLACK
                //    }
                //});
                let coordinates = polygon.getCoordinates()[0];

                for (let j = 0; j < coordinates.length - 1; j++) {
                    let flatten1 = [].concat.apply([], [coordinates[j], coordinates[j + 1]]);

                    var material = new Cesium.ImageMaterialProperty({
                        image: '/src/demos/hus/content/B543_mork_885x885-300x300.png',
                        repeat: new Cesium.Cartesian2(5.0, 5.0)
                    });

                    var wall_1 = this._dataSource.entities.add({
                        id: j.toString(),
                        wall: {
                            positions: Cesium.Cartesian3.fromDegreesArrayHeights(flatten1),
                            material: material
                        }
                    });

                }

                var roof = new Cesium.ImageMaterialProperty({
                    image: '/src/demos/hus/content/23882-p1.jpg',
                    repeat: new Cesium.Cartesian2(15, 15)
                });
                {
                    let coordinates1 = polygon.getCoordinates()[0];
                    let flatten1 = [].concat.apply([], coordinates1.slice(0, 6).concat(coordinates1.slice(coordinates1.length - 7, coordinates1.length - 1)));



                    var orangePolygon = this._dataSource.entities.add({
                        name: 'Orange polygon with per-position heights and outline',
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(
                                flatten1),
                            //  extrudedHeight: 0,
                            perPositionHeight: true,
                            material: roof,// Cesium.Color.BLACK,
                            outline: true,
                            outlineColor: Cesium.Color.BLACK
                        }
                    });
                }
                let coordinates1 = polygon.getCoordinates()[0];
                {

                    let flatten1 = [].concat.apply([], coordinates1.slice(9, 13));



                    var orangePolygon = this._dataSource.entities.add({
                        name: 'Orange polygon with per-position heights and outline',
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(
                                flatten1),
                            //  extrudedHeight: 0,
                            perPositionHeight: true,
                            material: roof,// Cesium.Color.BLACK,
                            outline: true,
                            outlineColor: Cesium.Color.BLACK
                        }
                    });
                }

                {
                    let flatten2 = [].concat.apply([], coordinates1.slice(5, 9).concat(coordinates1.slice(13, coordinates1.length - 6)));
                    var orangePolygon1 = this._dataSource.entities.add({
                        name: 'Orange polygon with per-position heights and outline',
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(
                                flatten2),
                            //  extrudedHeight: 0,
                            perPositionHeight: true,
                            material: roof,// Cesium.Color.BLACK,
                            // outline: true,
                            // outlineColor: Cesium.Color.BLACK
                        }
                    });
                }
                {
                    let doorol = new ol.geom.Polygon(door1.toPolygon());
                    doorol.transform(localproj, "EPSG:4326");
                    let doorcoordinate = [].concat.apply([], doorol.getCoordinates()[0]);

                    let door1Wall = this._dataSource.entities.add({

                        wall: {
                            positions: Cesium.Cartesian3.fromDegreesArrayHeights(doorcoordinate),
                            material: Cesium.Color.BLACK.withAlpha(0.9),
                            //   outline: true,
                            //  outlineColor: Cesium.Color.WHITE
                        }
                    });
                }

                {
                    let doorol = new ol.geom.Polygon(door2.toPolygon());
                    doorol.transform(localproj, "EPSG:4326");
                    let doorcoordinate = [].concat.apply([], doorol.getCoordinates()[0]);

                    let door1Wall = this._dataSource.entities.add({

                        wall: {
                            positions: Cesium.Cartesian3.fromDegreesArrayHeights(doorcoordinate),
                            material: Cesium.Color.BLACK.withAlpha(0.9),
                            //   outline: true,
                            //   outlineColor: Cesium.Color.WHITE
                        }
                    });
                }

                {
                    let start = [-6.5 - 1.5, -0.01];
                    createWindowParti(Cesium, this._dataSource, start, localproj, 2.6 + (+3.3 + 0.65 + 2.5 + 1.5) * Math.tan(20 / 180 * Math.PI) - 0.3, angle);
                }
                {
                    let start = [-6.5 - 1.5, 14.01];
                    createWindowParti(Cesium, this._dataSource, start, localproj, 2.6 + (+3.3 + 0.65 + 2.5 + 1.5) * Math.tan(20 / 180 * Math.PI) - 0.3, angle);
                }

                {
                    let start = [-6.5 - 1.5 + 0.01, 0] as ol.Coordinate;
                    AddGlass(Cesium, this._dataSource, start, 5, localproj, 0.02, 1.98, angle);
                    AddGlass(Cesium, this._dataSource, start, 5, localproj, 2.02, 3.98, angle);
                    AddGlass(Cesium, this._dataSource, start, 5, localproj, 4.02, 2.6 + (+3.3 + 0.65 + 2.5 + 1.5) * Math.tan(20 / 180 * Math.PI) - 0.3, angle);

                }
                {
                    let start = [-6.5 - 1.5 + 0.01, 14.0] as ol.Coordinate;
                    AddGlass(Cesium, this._dataSource, start, 2, localproj, 0.02, 1.98, angle, -1);
                    AddGlass(Cesium, this._dataSource, start, 2, localproj, 2.02, 3.98, angle, -1);
                    AddGlass(Cesium, this._dataSource, start, 2, localproj, 4.02, 2.6 + (+3.3 + 0.65 + 2.5 + 1.5) * Math.tan(20 / 180 * Math.PI) - 0.3, angle, -1);

                }
                {
                    let start = [-6.5 - 1.5 - 6 - 0.01, 14.01] as ol.Coordinate;
                    AddGlass(Cesium, this._dataSource, start, 2, localproj, 0.02, 1.98, angle, -1);
                    AddGlass(Cesium, this._dataSource, start, 2, localproj, 2.02, 3.98, angle, -1);
                    AddGlass(Cesium, this._dataSource, start, 2, localproj, 4.02, 2.6 + (+3.3 + 0.65 + 2.5 + 1.5) * Math.tan(20 / 180 * Math.PI) - 0.3, angle, -1);

                }
                {
                    let start = [-6.5 - 1.5 - 6 - 0.01, 0.0] as ol.Coordinate;
                    AddGlass(Cesium, this._dataSource, start, 1, localproj, 0.02, 1.98, angle);
                    AddGlass(Cesium, this._dataSource, start, 1, localproj, 2.02, 3.98, angle);
                    AddGlass(Cesium, this._dataSource, start, 1, localproj, 4.02, 2.6 + (+3.3 + 0.65 + 2.5 + 1.5) * Math.tan(20 / 180 * Math.PI) - 0.3, angle);

                }

                {
                    let start = [-6.5 - 0.01, 0] as ol.Coordinate;
                    AddGlass(Cesium, this._dataSource, start, 5, localproj, 0.02, 1.98, angle);
                    AddGlass(Cesium, this._dataSource, start, 5, localproj, 2.02, 3.98, angle);
                    AddGlass(Cesium, this._dataSource, start, 5, localproj, 4.02, 2.6 + (+3.3 + 0.65 + 2.5) * Math.tan(20 / 180 * Math.PI) - 0.3, angle);

                }

                {
                    addGarageDoubleDoor(Cesium, localproj, this._dataSource, [-22 - 0.4, 4.99], angle);
                    addGarageDoubleDoor(Cesium, localproj, this._dataSource, [-22 - 0.4 - 0.4 - 2.4, 4.99], angle);
                    addGarageDoor(Cesium, localproj, this._dataSource, [-28.01, 5.4], angle);
                }

                //badeværelse
                addWindow(Cesium, localproj, this._dataSource, [-14 - 1.3, 1.5 - 0.01], 180, 0.98, 0.8, 2.45, angle);

                //værelse
                addWindow(Cesium, localproj, this._dataSource, [-18, 1.5 - 0.01], 180, 0.98, 0.05, 2, angle);
                addWindow(Cesium, localproj, this._dataSource, [-18, 1.5 - 0.01], 180, 0.98, 2.02, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-19, 1.5 - 0.01], 180, 0.98, 0.8, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-20, 1.5 - 0.01], 180, 0.98, 0.8, 2.45, angle);


                //soveværelse
                addWindow(Cesium, localproj, this._dataSource, [-0.75, -0.01], 180, 0.98, 0.8, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-1.75, -0.01], 180, 0.98, 0.8, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [0.01, 2.2], 90, 0.98, 0.05, 2, angle);
                addWindow(Cesium, localproj, this._dataSource, [0.01, 2.2], 90, 0.98, 2.02, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [0.01, 1.2], 90, 0.98, 0.8, 2.45, angle);

                //badeværelse
                addWindow(Cesium, localproj, this._dataSource, [-0.25, 7.01], 180, 0.50, 0.05, 2, angle);
                addWindow(Cesium, localproj, this._dataSource, [-0.25, 7.01], 180, 0.50, 2.02, 2.45, angle);


                //stue
                addWindow(Cesium, localproj, this._dataSource, [-0.99, 7.5], 90, 0.98, 0.8, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-0.99, 8.5], 90, 0.98, 0.8, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-0.99, 9.5], 90, 0.98, 0.8, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-0.99, 10.5], 90, 0.98, 0.8, 2.45, angle);

                addWindow(Cesium, localproj, this._dataSource, [-6, 12.01], 180, 0.98, 0.05, 2, angle);
                addWindow(Cesium, localproj, this._dataSource, [-6, 12.01], 180, 0.98, 2.02, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-5, 12.01], 180, 0.98, 0.05, 2, angle);
                addWindow(Cesium, localproj, this._dataSource, [-5, 12.01], 180, 0.98, 2.02, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-4, 12.01], 180, 0.98, 0.05, 2, angle);
                addWindow(Cesium, localproj, this._dataSource, [-4, 12.01], 180, 0.98, 2.02, 2.45, angle);

                //værelse
                addWindow(Cesium, localproj, this._dataSource, [-14.5, 12.01], 180, 0.98, 0.05, 2, angle);
                addWindow(Cesium, localproj, this._dataSource, [-14.5, 12.01], 180, 0.98, 2.02, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-15.5, 12.01], 180, 0.98, 0.8, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-16.5, 12.01], 180, 0.98, 0.8, 2.45, angle);

                //værelse
                addWindow(Cesium, localproj, this._dataSource, [-18.5, 12.01], 180, 0.98, 0.05, 2, angle);
                addWindow(Cesium, localproj, this._dataSource, [-18.5, 12.01], 180, 0.98, 2.02, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-19.5, 12.01], 180, 0.98, 0.8, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-20.5, 12.01], 180, 0.98, 0.8, 2.45, angle);

                //garage
                addWindow(Cesium, localproj, this._dataSource, [-22.5, 10.01], 180, 0.98, 2.02, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-23.5, 10.01], 180, 0.98, 2.02, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-24.5, 10.01], 180, 0.98, 2.02, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-25.5, 10.01], 180, 0.98, 2.02, 2.45, angle);
                addWindow(Cesium, localproj, this._dataSource, [-26.5, 10.01], 180, 0.98, 2.02, 2.45, angle);



                {

                    let a = 0.25;
                    var window1 = new PathBuilder([-a, 4.55]).withHeight(0.01 +2.6+a * Math.tan(20 / 180 * Math.PI))
                        .extend(180, 1.4).withHeight(0.01 +2.6 + (1.4+a) * Math.tan(20 / 180 * Math.PI))
                        .extend(90, 1.4).withHeight(0.01 +2.6 + (1.4+a) * Math.tan(20 / 180 * Math.PI))
                        .extend(0, 1.4).withHeight(0.01 +2.6 + a * Math.tan(20 / 180 * Math.PI))
                        .close().withHeight(0.01+2.6 + (1.4+a) * Math.tan(20 / 180 * Math.PI)).rotate(angle);

                    let doorol = new ol.geom.Polygon(window1.toPolygon());
                    doorol.transform(localproj, "EPSG:4326");
                    let doorcoordinate = [].concat.apply([], doorol.getCoordinates()[0]);

                    let door1Wall = this._dataSource.entities.add({
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(
                                doorcoordinate),
                            //  extrudedHeight: 0,
                            perPositionHeight: true,
                            material: Cesium.Color.LIGHTCYAN.withAlpha(0.95),
                            outline: true,
                            outlineColor: Cesium.Color.BLACK,
                            outlineWidth: 10
                        }                            
                    });
                }

                {

                    let a = 0.80;
                    var window1 = new PathBuilder([-22+a, 5.35]).withHeight(0.01 + 2.6 + a * Math.tan(20 / 180 * Math.PI))
                        .extend(0, 1.4).withHeight(0.01 + 2.6 + (1.4 + a) * Math.tan(20 / 180 * Math.PI))
                        .extend(90, 1.4).withHeight(0.01 + 2.6 + (1.4 + a) * Math.tan(20 / 180 * Math.PI))
                        .extend(180, 1.4).withHeight(0.01 + 2.6 + a * Math.tan(20 / 180 * Math.PI))
                        .close().withHeight(0.01 + 2.6 + (1.4 + a) * Math.tan(20 / 180 * Math.PI)).rotate(angle);

                    let doorol = new ol.geom.Polygon(window1.toPolygon());
                    doorol.transform(localproj, "EPSG:4326");
                    let doorcoordinate = [].concat.apply([], doorol.getCoordinates()[0]);

                    let door1Wall = this._dataSource.entities.add({
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(
                                doorcoordinate),
                            //  extrudedHeight: 0,
                            perPositionHeight: true,
                            material: Cesium.Color.LIGHTCYAN.withAlpha(0.95),
                            outline: true,
                            outlineColor: Cesium.Color.BLACK,
                            outlineWidth: 10
                        }
                    });
                }

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
