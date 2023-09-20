import { createApp } from "vue";
import { wwtPinia } from "@wwtelescope/engine-pinia";
import UniqueWWTComponent from './UniqueWWTComponent.vue'
import { WWTComponent } from "@wwtelescope/engine-pinia";
import { v4 as uuidv4 } from 'uuid';

import App from "./App.vue";

const app = createApp(App, {
    wwtNamespace: `wwt-${uuidv4()}`,
  })
app.use(wwtPinia)
app.component('WorldWideTelescope', UniqueWWTComponent)

export function render({ model, el }) {
    app.mount(el)

    return () => app.unmount();
}
