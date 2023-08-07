import { createApp } from "vue";
import { wwtPinia, WWTComponent } from "@wwtelescope/engine-pinia";

import App from "./App.vue";

const app = createApp(App, {
    wwtNamespace: "mywwt"
  })
app.use(wwtPinia)
app.component('WorldWideTelescope', WWTComponent)

export function render({ model, el }) {
    app.mount(el)

    return () => app.unmount();
}
