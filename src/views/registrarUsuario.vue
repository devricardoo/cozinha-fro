<template>
  <v-container>
    <v-card class="pa-5 mx-auto mt-16" max-width="400">
      <v-card-title>Registro</v-card-title>
      <v-card-text>
        <v-form ref="registerForm" @submit.prevent="handleRegister">
          <v-text-field
            v-model="name"
            :rules="rules.name"
            label="Nome"
            required
          ></v-text-field>
          <v-text-field
            v-model="email"
            :rules="rules.email"
            label="E-mail"
            required
          ></v-text-field>
          <v-text-field
            v-model="password"
            :rules="rules.password"
            label="Senha"
            type="password"
            required
          ></v-text-field>
          <v-btn type="submit" block color="primary">Registrar</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>

  <v-dialog v-model="dialogRegistro" max-width="400">
    <v-card>
      <v-card-text class="mt-3">
        <v-icon color="green" class="mr-1 mb-1">mdi-check-circle</v-icon>
        {{ mensagemSucesso }}
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="fecharDialogRegistro">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import axios from "axios";

const nomeRules = [(value) => !!value || "O nome é obrigatório."];
const emailRules = [
  (value) => !!value || "O e-mail é obrigatório.",
  (value) => value.includes("@") || "Tipo de e-mail informado não é válido.",
];
const passwordRules = [
  (value) => !!value || "A senha é obrigatória.",
  (value) => value.length >= 6 || "A senha deve ter pelo menos 6 caracteres.",
];

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      mensagemSucesso: "Usuário registrado com sucesso!",
      dialogRegistro: false,
      rules: {
        name: nomeRules,
        email: emailRules,
        password: passwordRules,
      },
    };
  },
  mounted() {
    document.title = "Registrar";
  },
  methods: {
    async handleRegister() {
      const isValid = this.$refs.registerForm.validate();

      if (!isValid) return;
      try {
        const response = await axios.post(
          "http://localhost:8000/api/register",
          {
            name: this.name,
            email: this.email,
            password: this.password,
          }
        );

        this.dialogRegistro = true;
      } catch (error) {
        console.error("Erro ao registrar:", error);
      }
    },
    fecharDialogRegistro() {
      this.dialogRegistro = false;
      this.$router.push("/login");
    },
  },
};
</script>
