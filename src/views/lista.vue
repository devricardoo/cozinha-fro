<template>
  <v-container>
    <v-card class="mx-auto mt-3" max-width="570">
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
            <th>Quantidade mínima</th>
            <th>Quantidade máxima</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="nome in produtosPaginados" :key="nome.id">
            <td>{{ new Date(nome.created_at).toLocaleDateString() }}</td>
            <td>{{ nome.produto_nome }}</td>
            <td>{{ nome.quantidade_minima }}</td>
            <td>{{ nome.quantidade }}</td>
            <td class="text-right">
              <v-btn
                variant="text"
                class="float-end"
                @click="abrirEdicao(nome, index)"
              >
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

        <v-form ref="formAdicionar" @submit.prevent>
          <v-card-text>
            <v-text-field
              v-model="novoProduto.nome"
              :rules="rules.produtoRules"
              type="text"
              required
              label="Produto"
              :error-messages="erroProdutoNome"
              outlined
            ></v-text-field>

            <v-text-field
              v-model="novoProduto.quantidade_minima"
              label="Quantidade mínima"
              type="number"
              :rules="rules.quantidade"
              outlined
              :error-messages="erroQuantidade"
              required
            ></v-text-field>

            <v-text-field
              v-model="novoProduto.quantidade_maxima"
              label="Quantidade máxima"
              :rules="rules.quantidade"
              type="number"
              outlined
              :error-messages="erroQuantidade"
              required
            ></v-text-field>
          </v-card-text>
        </v-form>
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
          <v-form ref="formEditar" @submit.prevent>
            <v-text-field
              v-model="editItem.produto_nome"
              :rules="rules.produto"
              label="Produto"
              type="text"
              required
            ></v-text-field>

            <v-text-field
              v-model="editItem.quantidade_minima"
              label="Quantidade mínima"
              type="number"
              required
            ></v-text-field>

            <v-text-field
              v-model="editItem.quantidade"
              label="Quantidade máxima"
              :rules="rules.quantidade"
              type="number"
              required
            ></v-text-field>
            <v-btn color="green" text @click="salvarEdicao">Salvar</v-btn>
          </v-form>
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

const quantidadeRules = [
  (value) => !!value || "A quantidade é obrigatória.",
  (value) => !isNaN(value) || "A quantidade deve ser um número.",
];

export default {
  data() {
    return {
      produtosListar: [],
      rules: {
        produtoRules: [
          (value) => !!value || "Informe um produto.",
          (value) =>
            value.length >= 3 || "O produto deve ter pelo menos 3 caracteres.",
          (value) => {
            const existe = this.produtosListar.some(
              (item) => item.produto_nome === value
            );
            return (
              !existe || "O produto informado já existe na lista de produtos."
            );
          },
        ],
        quantidade_minima: quantidadeRules,
        quantidade: quantidadeRules,
      },
      abrirLista: false,
      editIndex: null,
      editItem: {},
      dialogEditar: false,
      page: 1,
      itemsPerPage: 6,
      novoNome: "",
      novoQuantidade: null,
      novoProduto: {
        nome: "",
        quantidade_minima: null,
        quantidade_maxima: null,
      },
      erroProdutoNome: "",
      erroQuantidade: "",
    };
  },
  computed: {
    produtosPaginados() {
      const start = (this.page - 1) * this.itemsPerPage;
      return this.produtosListar.slice(start, start + this.itemsPerPage);
    },
    pageCount() {
      return Math.ceil(this.produtosListar.length / this.itemsPerPage);
    },
  },
  methods: {
    salvarEdicao() {
      const form = this.$refs.formEditar;

      if (form && form.validate()) {
        api
          .put(
            `http://localhost:8000/api/cozinha/cadproduto/${this.editItem.id}`,
            {
              produto_nome: this.editItem.produto_nome,
              quantidade_minima: this.editItem.quantidade_minima,
              quantidade_maxima: this.editItem.quantidade_maxima,
            }
          )
          .then(() => {
            this.dialogEditar = false;
            this.buscarNomes();
          })
          .catch((error) => {
            console.error("Erro ao editar produto:", error);
          });
      }
    },

    buscarNomes() {
      api
        .get("http://localhost:8000/api/cozinha/cadproduto/")
        .then((response) => {
          this.produtosListar = response.data.sort((a, b) => {
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
      const form = this.$refs.formAdicionar;
      if (form && form.validate()) {
        const nomeMinusculo = this.novoProduto.nome.trim().toLowerCase();

        const produtoExist = this.produtosListar.some(
          (item) => item.produto_nome.trim().toLowerCase() === nomeMinusculo
        );

        if (produtoExist) {
          this.erroProdutoNome =
            "O produto informado já existe na lista de produtos.";
          return;
        }
        api
          .post("http://localhost:8000/api/cozinha/cadproduto", {
            produto_nome: this.novoProduto.nome,
            quantidade: this.novoProduto.quantidade_maxima,
            quantidade_minima: this.novoProduto.quantidade_minima,
          })
          .then((response) => {
            this.produtosListar.push(response.data);

            this.produtosListar.sort((a, b) => {
              return new Date(b.created_at) - new Date(a.created_at);
            });

            this.novoProduto.nome = "";
            this.novoProduto.quantidade_minima = null;
            this.novoProduto.quantidade_maxima = null;
            this.abrirLista = false;
          })
          .catch((error) => {
            if (error.response && error.response.status === 422) {
              const erros = error.response.data.errors;

              if (erros.produto_nome) {
                this.erroProdutoNome = erros.produto_nome[0];
              }
              if (erros.quantidade_maxima) {
                this.erroQuantidade = erros.quantidade_maxima[0];
              }
            } else {
              console.error("Erro desconhecido:", error);
            }
          });
      }
    },
  },
  mounted() {
    this.buscarNomes();

    api
      .get("http://localhost:8000/api/cozinha/cadproduto")
      .then((response) => {
        this.produtosListar = response.data.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
      })
      .catch((error) => {
        console.error("Erro ao buscar nomes:", error);
      });
  },
};
</script>
