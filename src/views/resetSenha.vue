<template>
  <v-container class="fill-height" fluid>
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="pa-6" elevation="6">
          <v-card-title class="text-h5 text-center mb-6">
            Redefinir Senha
          </v-card-title>

          <v-form ref="form" @submit.prevent="handleSubmit" v-model="valid">
            <v-text-field
              v-if="!codeSent"
              v-model="email"
              label="Email"
              prepend-inner-icon="mdi-email"
              :rules="emailRules"
              required
            ></v-text-field>

            <v-text-field
              v-if="codeSent"
              v-model="code"
              label="Código de 4 dígitos"
              prepend-inner-icon="mdi-key"
              :rules="codeRules"
              required
            ></v-text-field>

            <v-text-field
              v-if="codeSent"
              v-model="newPassword"
              label="Nova Senha"
              type="password"
              prepend-inner-icon="mdi-lock"
              :rules="passwordRules"
              required
            ></v-text-field>

            <v-text-field
              v-if="codeSent"
              v-model="newPasswordConfirmation"
              label="Confirmar Nova Senha"
              type="password"
              prepend-inner-icon="mdi-lock-check"
              :rules="passwordConfirmationRules"
              required
            ></v-text-field>

            <v-btn
              class="mt-4"
              :disabled="!valid || loading"
              :loading="loading"
              type="submit"
              color="primary"
              block
            >
              {{ codeSent ? "Redefinir Senha" : "Enviar Código" }}
            </v-btn>
          </v-form>

          <v-btn
            variant="text"
            class="mt-4"
            color="primary"
            @click="voltarLogin"
            block
          >
            Voltar
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";

const router = useRouter();
const email = ref("");
const code = ref("");
const newPassword = ref("");
const newPasswordConfirmation = ref("");

const valid = ref(false);
const loading = ref(false);
const message = ref("");
const alertType = ref("success");
const codeSent = ref(false);

const emailRules = [
  (v) => !!v || "E-mail é obrigatório",
  (v) => /.+@.+\..+/.test(v) || "E-mail inválido",
];

const codeRules = [
  (v) => !!v || "Código de 4 dígitos é obrigatório",
  (v) => /^[0-9]{4}$/.test(v) || "Código inválido",
];

const passwordRules = [
  (v) => !!v || "Nova senha é obrigatória",
  (v) => v.length >= 6 || "A senha precisa ter pelo menos 6 caracteres",
];

const passwordConfirmationRules = [
  (v) => !!v || "Confirmação da senha é obrigatória",
  (v) => v === newPassword.value || "As senhas não conferem",
];

const handleSubmit = async () => {
  loading.value = true;
  message.value = "";

  try {
    if (!codeSent.value) {
      // Envia o código para o e-mail
      await axios.post("http://localhost:8000/api/forgot-password", {
        email: email.value,
      });

      message.value =
        "Código enviado para o seu e-mail. Verifique sua caixa de entrada.";
      alertType.value = "success";
      codeSent.value = true;
    } else {
      // Envia a solicitação de redefinição de senha com o código e nova senha
      await axios.post("http://localhost:8000/api/reset-password", {
        reset_code: code.value,
        new_password: newPassword.value,
        new_password_confirmation: newPasswordConfirmation.value,
      });

      message.value = "Senha redefinida com sucesso!";
      alertType.value = "success";
      router.push("/login");
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      message.value = error.response.data.message;
    } else {
      message.value = "Erro ao processar sua solicitação.";
    }
    alertType.value = "error";
  } finally {
    loading.value = false;

    if (!codeSent.value) {
      email.value = "";
    } else {
      code.value = "";
      newPassword.value = "";
    }
  }
};

const voltarLogin = () => {
  router.push("/login");
};
</script>
