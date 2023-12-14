import {createApp, nextTick} from "vue";
import {wwtPinia} from "@wwtelescope/engine-pinia";
import UniqueWWTComponent from './UniqueWWTComponent.vue'
import {WWTComponent} from "@wwtelescope/engine-pinia";
import * as wwtlib from "@wwtelescope/engine";
import {v4 as uuidv4} from 'uuid';

import App from "./App.vue";

const app = createApp(App, {
    wwtNamespace: `wwt-${uuidv4()}`,
})
app.use(wwtPinia)
app.component('WorldWideTelescope', UniqueWWTComponent)

const ReferenceFramesRadius = {
    Sky: 149500000000,
    Sun: 696000000,
    Mercury: 2439700,
    Venus: 6051800,
    Earth: 6371000,
    Mars: 3390000,
    Jupiter: 69911000,
    Saturn: 58232000,
    Uranus: 25362000,
    Neptune: 24622000,
    Pluto: 1161000,
    Moon: 1737100,
    Io: 1821500,
    Europa: 1561000,
    Ganymede: 2631200,
    Callisto: 2410300
};

export function render({model, el}) {
    const vm = app.mount(el)
    window.vm = vm;

    vm.layers = {};

    // Setup custom message handling
    model.on("msg:custom", (msg) => {
        console.log(msg)

        let layer = null;

        switch (msg.event) {
            case "center_on_coordinates":
                vm.gotoRADecZoom({
                    "raRad": msg['ra'],
                    "decRad": msg['dec'],
                    "zoomDeg": msg['fov'],
                    "instant": msg['instant'],
                });
                break;
            case "table_layer_create":
                let frame = msg['frame'];

                let newLayer = vm.createTableLayer({
                    "dataCsv": atob(msg['table']),
                    "name": "New Table Layer",
                    "referenceFrame": frame
                })
                // layer = wwtlib.LayerManager.createSpreadsheetLayer(frame, "LM New Layer", atob(msg['table']));

                newLayer.then((layer) => {
                    layer.set_referenceFrame(frame);

                    // Override any guesses
                    layer.set_lngColumn(-1);
                    layer.set_latColumn(-1);
                    layer.set_altColumn(-1);
                    layer.set_sizeColumn(-1);
                    layer.set_colorMapColumn(-1);
                    layer.set_startDateColumn(-1);
                    layer.set_endDateColumn(-1);
                    layer.set_xAxisColumn(-1);
                    layer.set_yAxisColumn(-1);
                    layer.set_zAxisColumn(-1);

                    // FIXME: at the moment WWT incorrectly sets the mean radius of the object
                    // in the frame to that of the Earth, so we need to override this here.
                    let radius = ReferenceFramesRadius[frame];
                    if (radius != undefined) {
                        layer._meanRadius$1 = radius;
                    }

                    // FIXME: for now, this doesn't have any effect because WWT should add a 180
                    // degree offset but it doesn't - see
                    // https://github.com/WorldWideTelescope/wwt-web-client/pull/182 for a
                    // possible fix.
                    if (frame == 'Sky') {
                        layer.set_astronomical(true);
                    }

                    layer.set_altUnit(1);

                    // Remove the auto-added layer since it contains an id we don't know about in the python state
                    // vm.deleteLayer(layer.id);
                    // layer.id._guid = msg['id'];
                    // vm.wwtSpreadSheetLayers[msg['id']] = layer;
                    vm.layers[msg['id']] = layer;
                })

                break;
            case "table_layer_update":
                layer = vm.layers[msg['id']]

                vm.updateTableLayer({
                    'dataCsv': atob(msg['table']),
                    'id': layer.id})
                break;
            case "table_layer_set":
                layer = vm.layers[msg['id']];
                let name = msg['setting'];
                let value = null;

                //if (name.includes('Column')) { // compatability issues?
                if (name.indexOf('Column') >= 0) {
                    value = layer.get__table().header.indexOf(msg['value']);
                } else if (name == 'color') {
                    value = wwtlib.Color.fromHex(msg['value']);
                } else if (name == 'colorMapper') {
                    value = wwtlib.ColorMapContainer.fromArgbList(msg['value']);
                } else if (name == 'altUnit') {
                    value = wwtlib.AltUnits[msg['value']];
                } else if (name == 'raUnits') {
                    value = wwtlib.RAUnits[msg['value']];
                } else if (name == 'altType') {
                    value = wwtlib.AltTypes[msg['value']];
                } else if (name == 'plotType') {
                    value = wwtlib.PlotTypes[msg['value']];
                } else if (name == 'markerScale') {
                    value = wwtlib.MarkerScales[msg['value']];
                } else if (name == 'coordinatesType') {
                    value = wwtlib.CoordinatesTypes[msg['value']];
                } else if (name == 'cartesianScale') {
                    value = wwtlib.AltUnits[msg['value']];
                } else {
                    value = msg['value']
                }

                layer["set_" + name](value);
                break;
            case 'table_layer_remove':
                layer = vm.layers[msg['id']];
                vm.deleteLayer(layer.id);
                break;
            case "load_image_collection":
                vm.loadImageCollection(msg['url'])
                break;
            case "set_foreground_by_name":
                vm.setForegroundImageByName(msg['name'])
                break;
            case "set_background_by_name":
                vm.setBackgroundImageByName(msg['name'])
                break;
            case "set_foreground_opacity":
                vm.setForegroundOpacity(msg['value'])
                break;
            default:
                console.log(`Received uncaught custom message of type ${msg.event}.`)
        }
    })

    // initialize(model, el);
    // Forward events from within the Vue app to the python model
    window.addEventListener(
        "message",
        (event) => {
            console.log("RECEIVED", event);
        }, false);

    return () => app.unmount();
}
