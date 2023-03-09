import {WWTInstance} from "@wwtelescope/engine-helpers";
import {v4 as uuidv4} from 'uuid';

export async function render(view) {
    let id = `${uuidv4()}`;

    let wwt_div = document.createElement("div");
    wwt_div.setAttribute('id', id);
    wwt_div.setAttribute('style', "width: 750px; height: 750px")

    view.el.appendChild(wwt_div);

    view.displayed.then((v) => {
        onRenderWWT(id);
    });
}

async function onRenderWWT(id) {
    const wwt = new WWTInstance({
        elId: id,
        startInternalRenderLoop: true,
    });

    await wwt.waitForReady();
}