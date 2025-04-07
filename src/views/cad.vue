<template>
  <div class="d-flex align-center justify-center fill-height">
    <v-sheet class="mx-auto" width="300">
      <v-form fast-fail @submit.prevent>
        <v-text-field
          v-model="date"
          :rules="dateRules"
          label="Data"
          type="date"
          @input="formatInput"
          required
        ></v-text-field>

        <v-text-field
          v-model="produto"
          :rules="produtoRules"
          label="Produto"
          type="text"
          @input="formatInput"
          required
        ></v-text-field>

        <v-text-field
          v-model="quantidade"
          :rules="quantidadeRules"
          label="Quantidade"
          type="number"
          @input="formatInput"
          required
        ></v-text-field>

        <v-text-field
          v-model="descricao"
          :rules="descricaoRules"
          label="Descrição"
          type="text"
          @input="formatInput"
          required
        ></v-text-field>

        <v-btn class="mt-2" type="submit" block color="#00897B"
          >Cadastrar</v-btn
        >
      </v-form>
    </v-sheet>
  </div>
</template>

<script setup>
import { ref } from "vue";

// para deixar os inputs reativos quando colocarem o valor e mudar de input
const date = ref("");
const produto = ref("");
const quantidade = ref("");
const descricao = ref("");

const dialog = ref(false);

const dateRules = [
  (value) => {
    if (value) return true;
    return "A data é obrigatória.";
  },
];
const produtoRules = [
  (value) => {
    if (value) return true;
    return "O produto é obrigatório.";
  },
];
const quantidadeRules = [
  (value) => {
    if (value) return true;
    return "A quantidade é obrigatória.";
  },
];
const descricaoRules = [
  (value) => {
    if (value) return true;
    return "A descrição é obrigatória.";
  },
];
</script>
