<template>
  <v-container>
    <v-card class="mx-auto mt-3" max-width="500">
      <v-card-title class="text-center">
        Lista de Produtos
        <v-spacer></v-spacer>
      </v-card-title>
      <v-divider></v-divider>
      <v-table class="ml-2">
        <thead>
          <tr>
            <th>
              <strong>Data</strong>
            </th>
            <th>
              <strong>Nome</strong>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="nome in produtosPaginados" :key="nome.id">
            <td>{{ new Date(nome.created_at).toLocaleDateString() }}</td>
            <td>{{ nome.produto_nome }}</td>
            <td class="text-right">
              <v-btn variant="text" @click="abrirEdicao(nome, index)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-pagination
        style="color: #4db6ac"
        v-model="page"
        :length="pageCount"
      ></v-pagination>
    </v-card>
    <v-container class="d-flex justify-center">
      <v-btn color="#00897B" @click="abrirLista = true">
        <v-icon>mdi-plus</v-icon>
        Adicionar
      </v-btn>
    </v-container>

    <!-- Modal para adicionar nome -->
    <v-dialog v-model="abrirLista" max-width="400">
      <v-card>
        <v-card-title>Adicionar produto</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="novoNome"
            :rules="rules.nome"
            label="Produto"
            outlined
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="abrirLista = false">Cancelar</v-btn>
          <v-btn color="green" @click="adicionarNomeProduto()">Salvar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de Edição -->
    <v-dialog v-model="dialogEditar" max-width="400">
      <v-card>
        <v-card-title class="text-h5">Editar Produto</v-card-title>
        <v-card-text>
          <form @submit.prevent>
            <v-text-field
              v-model="editItem.produto_nome"
              label="Produto"
            ></v-text-field>
            <v-btn color="green" text @click="salvarEdicao">Salvar</v-btn>
          </form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogEditar = false">Cancelar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "../axios";

const nomeRules = [
  (value) => !!value || "Informe um produto.",
  (value) => value.length >= 3 || "O produto deve ter pelo menos 3 caracteres.",
];

export default {
  data() {
    return {
      nomes: [],
      rules: {
        nome: nomeRules,
      },
      abrirLista: false,
      editIndex: null,
      editItem: {},
      dialogEditar: false,
      page: 1,
      itemsPerPage: 6,
      novoNome: "",
      novoProduto: {
        nome: "",
      },
    };
  },
  computed: {
    produtosPaginados() {
      const start = (this.page - 1) * this.itemsPerPage;
      return this.nomes.slice(start, start + this.itemsPerPage);
    },
    pageCount() {
      return Math.ceil(this.nomes.length / this.itemsPerPage);
    },
    produtosFormatados() {
      return this.nomes.map((item) => ({
        text: item.produto_nome,
        value: item.id,
      }));
    },
  },
  methods: {
    salvarEdicao() {
      api
        .put(`/cozinha/cadproduto/${this.editItem.id}`, {
          produto_nome: this.editItem.produto_nome,
        })
        .then(() => {
          this.dialogEditar = false;
          this.buscarNomes();
        })
        .catch((error) => {
          console.error("Erro ao editar produto:", error);
        });
    },

    buscarNomes() {
      api
        .get("/cozinha/cadproduto/")
        .then((response) => {
          this.nomes = response.data.sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
          });
        })
        .catch((error) => {
          console.error("Erro ao buscar nomes:", error);
        });
    },
    abrirEdicao(item, index) {
      this.editItem = JSON.parse(JSON.stringify(item));
      this.editIndex = index;
      this.dialogEditar = true;
    },
    adicionarNomeProduto() {
      api
        .post("/cozinha/cadproduto", {
          produto_nome: this.novoNome,
        })
        .then((response) => {
          this.nomes.push(response.data);
          this.abrirLista = false;
          this.novoNome = "";
        })
        .catch((error) => {
          console.error("Erro ao adicionar nome:", error);
        });
    },
  },
  mounted() {
    this.buscarNomes();
  },
};
</script>
