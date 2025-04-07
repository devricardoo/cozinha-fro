<template>
  <v-app id="inspire" theme="light">
    <template v-if="!isLayoutDisabled">
      <!-- Navigation Drawer -->
      <v-navigation-drawer v-model="drawer" color="#00695C" temporary>
        <v-list-item title="Sistema de estoque"></v-list-item>
        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-home"
            title="Inicio"
            value="inicio"
            to="/"
          >
          </v-list-item>

          <v-list-item
            prepend-icon="mdi-view-list"
            v-if="autorizado"
            title="Lista"
            value="lista"
            to="/lista"
          >
          </v-list-item>

          <v-dialog v-model="dialog" width="auto">
            <v-card max-width="600" width="400" height="800">
              <cad class="mt-10"></cad>
              <template v-slot:actions>
                <v-btn
                  class="ms-auto"
                  text="Fechar"
                  @click="dialog = false"
                  to="/"
                ></v-btn>
              </template>
            </v-card>
          </v-dialog>
        </v-list>
      </v-navigation-drawer>

      <!-- App Bar -->
      <v-app-bar app elevated height="80" color="#00897B">
        <template v-slot:prepend>
          <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>Seja bem-vindo(a)</v-app-bar-title>
        <v-btn icon>
          <v-icon @click="active = !active">mdi-dots-vertical</v-icon>
          <v-menu activator="parent">
            <v-list width="75" class="pa-0 mt-2">
              <v-list-item
                v-for="(item, index) in items"
                :key="index"
                :value="index"
              >
                <v-list-item-title style="color: #00897b" @click="logout">{{
                  item.title
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-btn>
      </v-app-bar>
    </template>
    <v-main>
      <!-- Conteúdo principal aqui -->
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

import emitter from "./eventBus";

import cad from "./views/cad.vue";
import verTabelas from "./views/verTabelas.vue";

// Estado reativo
const drawer = ref(false);
const dialog = ref(false);
const active = ref(false);
const usuario = ref(null);
const items = [{ title: "Sair" }];

// Rotas e controle de layout
const route = useRoute();
const router = useRouter();

const rotasSemLayout = ["/registrar", "/login"];
const isLayoutDisabled = computed(() => rotasSemLayout.includes(route.path));

onMounted(() => {
  const user = localStorage.getItem("user");
  if (user) {
    usuario.value = JSON.parse(user);
  }

  emitter.on("usuarioLogado", (usr) => {
    usuario.value = usr;
  });
});

// Verifica autorização do usuário
const autorizado = computed(() => {
  return usuario.value?.email === "pauloric@gmail.com";
});

// Função de logout
const logout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};
</script>
