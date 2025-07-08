<template>
  <div>
    <v-container>
      <v-card class="pa-5 mx-auto mt-16" max-width="400">
        <v-card-title>Login</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleLogin">
            <v-text-field
              v-model="email"
              label="E-mail"
              required
            ></v-text-field>
            <v-text-field
              v-model="password"
              label="Senha"
              type="password"
              required
            ></v-text-field>
            <v-btn type="submit" block color="primary">Entrar</v-btn>
          </v-form>
        </v-card-text>
        <v-btn
          variant="text"
          style="font-size: 12px; margin-top: -12px"
          color="primary"
          to="/reset"
          >Esqueci minha senha</v-btn
        >
        <v-btn
          variant="text"
          class="d-flex justify-center"
          color="primary"
          to="/registrar"
          >Registrar-se</v-btn
        >
      </v-card>
    </v-container>

    <v-dialog
      v-model="dialogErro"
      max-width="300"
      transition="dialog-bottom-transition"
    >
      <v-card>
        <v-card-text class="text-center mt-3">
          <v-icon color="red" size="30">mdi-alert-circle</v-icon>
          <p class="mt-4 text-body-2">{{ loginErro }}</p>
          <v-btn
            color="red"
            class="mt-2"
            variant="text"
            @click="fecharDialogErro"
            >Fechar</v-btn
          >
        </v-card-text>
      </v-card>
    </v-dialog>

    <escolher-perfil
      v-if="mostrarEscolhaPerfil"
      v-model="mostrarEscolhaPerfil"
      :roles="useRoles"
      @escolhido="entrarComo"
    />
  </div>
</template>

<script>
//import auth from "@/services/auth";
import axios from "axios";
import emitter from "@/eventBus";
import EscolherPerfil from "@/views/escolherPerfil.vue";

export default {
  data() {
    return {
      mostrarEscolhaPerfil: false,
      email: "",
      password: "",
      loginErro: "",
      dialogErro: false,
      useRoles: [],
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post("http://localhost:8080/api/login", {
          email: this.email,
          password: this.password,
        });

        const token = response.data.token;
        const users = response.data.user;

        // Armazena o token
        localStorage.setItem("token", token);

        // Armazena o usuário com suas roles
        localStorage.setItem("user", JSON.stringify(users));

        this.useRoles = users.roles;

        // Define o token nos headers para as próximas requisições
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        emitter.emit("usuarioLogado", users);

        // Verifica se o usuário tem a role 'admin' dentro da lista de roles
        const isAdmin = users.roles.some((role) => role.name === "admin");
        const isUser = users.roles.some((role) => role.name === "user");

        if (isAdmin && isUser) {
          this.mostrarEscolhaPerfil = true;
        } else if (isAdmin) {
          localStorage.setItem("modoEntrada", "admin");
          this.$router.push("/");
        } else if (isUser) {
          localStorage.setItem("modoEntrada", "usuario");
          this.$router.push("/");
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.loginErro = "E-mail ou senha incorretos.";
        } else {
          this.loginErro =
            "Erro ao tentar fazer login. Por favor, tente novamente.";
        }
        this.dialogErro = true;
      }
    },
    fecharDialogErro() {
      this.dialogErro = false;
    },
    entrarComo(modo) {
      localStorage.setItem("modoEntrada", modo);
      this.$router.push("/");
    },
  },
  components: { EscolherPerfil },
};
</script>
