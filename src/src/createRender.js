import * as wwtlib from "@wwtelescope/engine";
import { classicPywwt } from "@wwtelescope/research-app-messages";
import {CenterOnCoordinatesMessage} from "@wwtelescope/research-app-messages/dist/src/classic_pywwt.js";

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

export function createRender(app) {
	return ({ model, el }) => {
        // let _appUrl = location.toString();
        // let _appOrigin = _appUrl.origin;
        //
        // var iframe = document.createElement('iframe');
        // // Pass our origin so that the iframe can validate the provenance of the
        // // messages that are posted to it. This isn't acceptable for real XSS
        // // prevention, but so long as the research app can't do anything on behalf
        // // of the user (which it can't right now because we don't even have
        // // "users"), that's OK.
        // iframe.src = _appUrl + '?origin=' + encodeURIComponent(location.origin);
        // iframe.style.setProperty('height', '400px', '');
        // iframe.style.setProperty('width', '100%', '');
        // iframe.style.setProperty('border', 'none', '');

        let div = document.createElement('div');
        div.setAttribute("id", "app-wrapper");
        // div.appendChild(iframe)
        div.style.setProperty('height', '400px', '');
        div.style.setProperty('width', '100%', '');
        div.style.setProperty('border', 'none', '');

        el.appendChild(div);

        let vm = app.mount(div);

        window.vm = vm;

        vm.layers = {};

        // TODO: This should be working...
        model.send(JSON.stringify({test: "TESTING"}));

        // Setup custom message handling
        model.on("msg:custom", (msg) => {
            console.log(msg)

            let layerId = null;
            let proxyLayer = null;
            let layer = null;
            let event = null;

            switch (msg.event) {
                case "center_on_coordinates":
                    event = new CustomEvent("message", {bubbles: true, detail: msg});

                    console.log(classicPywwt.isCenterOnCoordinatesMessage(msg));

                    // vm.onMessage(msg);

                    // window.dispatchEvent(event);
                    window.postMessage(msg);
                    break;
                case "table_layer_create":
                    event = new CustomEvent("message", {bubbles: true, detail: msg});

                    console.log(classicPywwt.isCreateTableLayerMessage(msg));

                    // vm.onMessage(msg);

                    // window.dispatchEvent(event);

                    window.postMessage(msg);

                    break;
                case "table_layer_update":
                    [layerId, proxyLayer] = Object.entries(vm.wwtSpreadSheetLayers).filter( ([key, item]) => item.name === msg['id']).at(0);
                    layer = vm.spreadSheetLayerById(layerId);

                    vm.updateTableLayer({
                        'dataCsv': atob(msg['table']),
                        'id': layer.id.toString()})
                    break;
                case "table_layer_set":
                    [layerId, proxyLayer] = Object.entries(vm.wwtSpreadSheetLayers).filter( ([key, item]) => item.name === msg['id']).at(0);
                    layer = vm.spreadSheetLayerById(layerId);

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

                    msg['value'] = value;
                    // msg['id'] = layerId;
                    // vm.onMessage(msg)
                    window.postMessage(msg);
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

        // Forward events from within the Vue app to the python model
        window.addEventListener(
            "message",
            (event) => {
                // model.send(event.data);
                console.log("SENDING EVENT TO PYTHON");
                console.log(event.data);
                model.send(event.data);
            }, false);

		return () => app.unmount();
	};
}