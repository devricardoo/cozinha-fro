// main.js ou main.ts

import { createApp } from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify"; // Verifique o caminho correto
import router from "./router";

const app = createApp(App);

app.use(vuetify); // Registre o Vuetify no Vue
app.use(router);
app.mount("#app");
