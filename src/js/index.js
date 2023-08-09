import { createApp } from "vue";
import { wwtPinia } from "@wwtelescope/engine-pinia";
import UniqueWWTComponent from './UniqueWWTComponent.vue'

import App from "./App.vue";

const app = createApp(App, {
    wwtNamespace: "mywwt"
  })
app.use(wwtPinia)
app.component('WorldWideTelescope', UniqueWWTComponent)

export function render({ model, el }) {
    app.mount(el)

    return () => app.unmount();
}
