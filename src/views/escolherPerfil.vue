<template>
  <v-dialog v-model="mostrar" max-width="400">
    <v-card>
      <v-card-title>Escolha como deseja entrar</v-card-title>
      <v-card-text class="text-center">
        <v-btn color="primary" class="mb-3" block @click="escolher('admin')">
          Entrar como Administrador
        </v-btn>
        <v-btn color="primary" block @click="escolher('usuario')">
          Entrar como Usuário
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue", "escolhido"]);

const mostrar = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

function escolher(modo) {
  emit("escolhido", modo);
  mostrar.value = false;
}
</script>
