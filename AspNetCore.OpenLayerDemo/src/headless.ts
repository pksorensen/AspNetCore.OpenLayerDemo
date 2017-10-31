

import * as fs from "fs";
import * as http from "http";
import phantom = require('phantom');
import websocket = require('websocket');

console.log("HostRunner loaded");

declare module "phantom" {

    interface WebPage {
        evaluateJavaScript<R>(str): PromiseLike<R>;
        onCallback(callback);
    }
}

var onConsoleMessage = function (msg) {

    console.log(msg);

}


export default async function (options, callback) {
    console.log("HostRunner called");

    try {
        var WebSocketServer = websocket.server;
        var server = http.createServer(function (request, response) {
            // process HTTP request. Since we're writing just WebSockets server
            // we don't have to implement anything.
        });
        server.listen(1337, function () { });

        // create the server
        let wsServer = new WebSocketServer({
            httpServer: server
        });

        console.log("HostRunner websocket created");

        let instance = await phantom.create();
        let page = await instance.createPage();
        console.log("HostRunner phantom page created");

        page.property('viewportSize', { width: 800, height: 600 });
        page.property('onConsoleMessage', onConsoleMessage);
        page.property('onError', onConsoleMessage);

      //  await page.evaluateJavaScript("function(){console.log(\"TEST\");}");
        //  await page.evaluateJavaScript("function(){require([\"es6-promise\"],function(module){module.polyfill();})}");
     //   console.log(await page.injectJs("../node_modules/es6-promise/es6-promise.auto.min.js"));

        let data = await new Promise((resolve, reject) => {

            wsServer.on('request', function (request) {

                var connection = request.accept(null, request.origin);
                console.log("HostRunner websocket connection started");
                // This is the most important callback for us, we'll handle
                // all messages from users here.

                let parts = {};

                connection.on('message', function (message) {
                    console.log("HostRunner websocket message recieved :" + message.type);
                    if (message.type === 'utf8') {
                        // process WebSocket message

                        let event = JSON.parse(message.utf8Data);

                        if ("partId" in event) {
                            console.log(`Recieved part ${event.partId} ${event.part.length}`);
                            if (!(event.id in parts)) {
                                parts[event.id] = [];
                            }
                            parts[event.id].push(event.part);

                            if (!event.last) {
                                return;
                            }
                            console.log(`Recieved last part ${event.partId} ${event.part.length}`);
                            event.data = JSON.parse(parts[event.id].join(""));

                        }

                        switch (event.type) {
                            case "CHANGE_VIEWPORT_SIZE":

                                page.property('viewportSize', event.data).then(() => {
                                    if (event.id) {
                                        connection.send(JSON.stringify({ id: event.id }));
                                    }
                                });

                                break;
                            case "PAGE_RENDER":
                                page.render(options.outputPrefix + event.data.path).then(() => {
                                    if (event.id) {
                                        connection.send(JSON.stringify({ id: event.id }));
                                    }
                                });

                                break;
                            case "READ_FILE":

                                fs.readFile(options.outputPrefix + event.data.path, event.data.encoding || 'utf8', (err, data) => {

                                    console.log("read file");
                                    console.log(err);
                                    console.log(data);
                                    if (event.id) {

                                        connection.send(JSON.stringify({ id: event.id, data: data, err: err }));
                                    }
                                });

                                break;
                            case "WRITE_FILE":

                                console.log(options.outputPrefix);
                                console.log(event.data.path);

                                fs.writeFile(options.outputPrefix + event.data.path, event.data.content, function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("The file was saved!");
                                    }


                                    if (event.id) {
                                        connection.send(JSON.stringify({ id: event.id }));
                                    }

                                });

                                break;
                            case "LOADED":



                                page.evaluateJavaScript<number>("function () { require(['main']); }")
                                    .then(() => {
                                        if (event.id) {
                                            connection.send(JSON.stringify({ id: event.id }));
                                        }
                                    });


                                break;

                            case "COMPLETE":


                                resolve(event.data);

                                break;
                            case "FAIL":

                                resolve(event.data);

                        }
                    }


                });

                connection.on('close', function (connection) {
                    // close user connection
                    console.log("HostRunner websocket connection closed");
                });
            });




            page.open(options.headless).then((status) => {
                console.log("status: " + status);

                if (status === "success") {
                    let dataconfig = `function(){
                            requirejs.config({config:{'main':${JSON.stringify(options.data)}}});
                        }`;
                    page.evaluateJavaScript(dataconfig);
                    console.log(dataconfig);
                }

            }, (err) => {
                console.log("Failed to run host");
                callback(err, null);
            });
            console.log("HostRunner returning promise");
        });

        console.log("Exit");
        page.close();
        instance.exit();

        wsServer.closeAllConnections();
        server.close();

        callback(null, data);

    } catch (err) {
        callback(err);
    }

  
}
