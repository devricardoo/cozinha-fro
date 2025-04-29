/**
 * router/index.ts
 * ../pages/index.vue
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from "vue-router/auto";
import { routes } from "vue-router/auto-routes";

import Registro from "@/layouts/Registro.vue";
import registrarUsers from "../views/registrarUsuario.vue";
import login from "../views/login.vue";
import resetarSenha from "../views/resetSenha.vue";
import Reset from "@/layouts/ResetSenha.vue";

const additionalRoutes = [
  {
    path: "",
    component: () => import("../views/verTabelas.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/lista",
    name: "lista",
    component: () => import("../views/lista.vue"),
    meta: { requiresAuth: true, onlyAdmin: true },
  },
  {
    path: "/cadastroUsuarios",
    name: "cadUsuario",
    component: () => import("../views/cadastUsuarios.vue"),
    meta: { requiresAuth: true, onlyAdmin: true },
  },
  {
    path: "/registrar",
    component: Registro,
    children: [
      {
        path: "",
        name: "Registro",
        component: registrarUsers,
      },
    ],
  },
  {
    path: "/reset",
    component: Reset,
    children: [
      {
        path: "",
        name: "Reset",
        component: resetarSenha,
      },
    ],
  },
  {
    path: "/login",
    component: Registro,
    children: [
      {
        path: "",
        name: "Login",
        component: login,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Adiciona rotas manuais ao roteador
additionalRoutes.forEach((route) => {
  router.addRoute(route);
});

// Proteção de rotas (auth guard)
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const users = JSON.parse(localStorage.getItem("user"));
  const modoEntrada = localStorage.getItem("modoEntrada");

  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else if (to.meta.onlyAdmin) {
    if (
      users &&
      users.roles?.some((role) => role.name === "admin") &&
      modoEntrada === "admin"
    ) {
      next();
    } else {
      next("/"); // redireciona caso não seja admin
    }
  } else {
    next(); // rota pública ou apenas requiresAuth
  }
});

router.onError((err, to) => {
  if (err?.message?.includes?.("Failed to fetch dynamically imported module")) {
    if (!localStorage.getItem("vuetify:dynamic-reload")) {
      console.log("Reloading page to fix dynamic import error");
      localStorage.setItem("vuetify:dynamic-reload", "true");
      location.assign(to.fullPath);
    } else {
      console.error("Dynamic import error, reloading page did not fix it", err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem("vuetify:dynamic-reload");
});

export default router;
