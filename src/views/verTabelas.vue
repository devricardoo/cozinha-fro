<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col>
          <v-card
            class="mx-auto flat"
            max-width="650"
            style="border: none; box-shadow: none"
          >
            <div class="d-flex justify-end">
              <v-card class="flat border mb-1" width="100">
                <div>
                  <v-btn
                    color="#4db6ac"
                    variant="text"
                    size="small"
                    @click="abrirAdicionar"
                  >
                    Adicionar
                  </v-btn>
                </div>
              </v-card>
            </div>

            <v-table density="compact">
              <thead>
                <tr style="background: #4db6ac; color: #fff">
                  <th class="text-left">Data</th>
                  <th class="text-left">Produto</th>
                  <th class="text-left">Quantidade</th>
                  <th class="text-left">Descrição</th>
                  <th class="text-left">Ações</th>
                </tr>
              </thead>
              <tbody style="background: #eceff1">
                <tr v-for="(item, index) in produtosPaginados" :key="index">
                  <td>
                    {{ formatarData(item.data) }}
                  </td>
                  <td>
                    {{
                      item.produto && item.produto.produto_nome
                        ? item.produto.produto_nome
                        : "—"
                    }}
                  </td>
                  <td>{{ item.quantidade }}</td>
                  <td>{{ item.descricao }}</td>
                  <td>
                    <v-btn variant="text" @click="abrirEdicao(item)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      variant="text"
                      color="red"
                      @click="abrirExclusao(item)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>

            <v-pagination
              style="color: #4db6ac"
              v-model="page"
              :length="pageCount"
              class="mt-4"
            ></v-pagination>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Modal de Adicionar Produto -->
    <v-dialog v-model="dialogAdicionar" max-width="400">
      <v-card>
        <v-card-title class="text-h5 text-center"
          >Adicionar Produto</v-card-title
        >
        <v-card-text>
          <v-form ref="formAdicionar" fast-fail @submit.prevent>
            <v-text-field
              v-model="novoProduto.data"
              label="Data"
              :rules="rules.date"
              type="date"
              required
            ></v-text-field>

            <v-select
              v-model="novoProduto.produto_id"
              :items="produtosFormatados"
              item-value="value"
              item-title="text"
              :rules="rules.produto"
              label="Produto"
              required
              @update:modelValue="(val) => atualizarQuantidadeMaxima(val)"
            ></v-select>

            <v-text-field
              v-model="novoProduto.quantidade"
              label="Quantidade"
              :rules="rules.quantidade"
              type="number"
              required
            ></v-text-field>

            <v-text-field
              v-model="novoProduto.descricao"
              label="Descrição"
              :rules="rules.descricao"
              type="text"
              required
            ></v-text-field>

            <v-btn color="green" class="mt-2" text @click="adicionarItem()"
              >Adicionar</v-btn
            >
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialogAdicionar = false">Cancelar</v-btn>
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
              v-model="editItem.data"
              :rules="rules.date"
              label="Data"
              type="date"
            ></v-text-field>
            <v-select
              v-model="editItem.produto_id"
              :items="produtosFormatados"
              :rules="rules.produto"
              item-value="value"
              item-title="text"
              label="Produto"
              @update:modelValue="(val) => atualizarQuantidadeMaxima(val)"
              required
            >
            </v-select>

            <v-text-field
              v-model="editItem.quantidade"
              :rules="rules.quantidade"
              label="Quantidade"
              type="number"
            ></v-text-field>
            <v-text-field
              v-model="editItem.descricao"
              :rules="rules.descricao"
              label="Descrição"
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

    <!-- Modal de Confirmação exclusao -->
    <v-dialog v-model="dialogExcluir" max-width="400">
      <v-card>
        <v-card-title class="text-h5 mt-2 ml-2"
          >Confirmar Exclusão</v-card-title
        >
        <v-card-text>
          Tem certeza que deseja excluir o produto
          <strong>{{ deleteItem.produto.produto_nome }}</strong
          >?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="dialogExcluir = false"
            >Cancelar</v-btn
          >
          <v-btn color="red" text @click="confirmarExclusao">Excluir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
</template>

<script>
import api from "../axios";
import lista from "./lista.vue";

const dateRules = [(value) => !!value || "A data precisa ser informada."];

const descricaoRules = [
  (value) => !!value || "A descrição é obrigatória.",
  (value) =>
    value.length >= 3 || "A descrição deve ter pelo menos 3 caracteres.",
];

export default {
  components: { lista },
  data() {
    return {
      quantidadeMaxima: null,
      rules: {
        date: dateRules,
        produto: [
          (value) => !!value || "Escolha um produto.",
          (value) => {
            const existe = this.produtosListar.some(
              (item) => item.produto_id === value
            );
            return !existe || "Este produto já foi adicionado.";
          },
        ],
        quantidade: [
          (value) => !!value || "A quantidade é obrigatória.",
          (value) =>
            !this.quantidadeMaxima ||
            value <= this.quantidadeMaxima ||
            `A quantidade deve ser no máximo ${this.quantidadeMaxima}.`,
          (value) => value > 0 || "A quantidade deve ser maior que zero.",
        ],
        descricao: descricaoRules,
      },
      produtosListar: [],
      produtosDisponiveis: [],
      produtosAPI: [],
      page: 1,
      itemsPerPage: 5,
      novoProduto: {
        data: "",
        produto_id: null,
        quantidade: null,
        descricao: "",
      },
      dialogAdicionar: false,
      dialogEditar: false,
      dialogExcluir: false,
      editItem: {},
      editIndex: null,
      deleteItem: {},
      deleteIndex: null,
    };
  },
  computed: {
    produtosFormatados() {
      return this.produtosDisponiveis.map((item) => ({
        text: item.produto_nome,
        value: item.id,
      }));
    },
    produtosPaginados() {
      const start = (this.page - 1) * this.itemsPerPage;
      return this.produtosListar.slice(start, start + this.itemsPerPage);
    },
    pageCount() {
      return Math.ceil(this.produtosListar.length / this.itemsPerPage);
    },
  },
  methods: {
    formatarData(data) {
      if (!data) return "";
      return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
    },
    abrirAdicionar() {
      this.dialogAdicionar = true;
    },
    abrirEdicao(item, index) {
      this.quantidadeMaxima = item.quantidade;
      this.editItem = JSON.parse(JSON.stringify(item));
      this.editIndex = index;
      this.dialogEditar = true;
    },
    abrirExclusao(item, index) {
      this.deleteItem = JSON.parse(JSON.stringify(item));
      this.deleteIndex = index;
      this.dialogExcluir = true;
    },
    atualizarProdutosEdicao() {
      api
        .get("http://localhost:8000/api/cozinha/produto", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          this.produtosListar = response.data.sort((a, b) => {
            return new Date(b.data) - new Date(a.data);
          });
        })
        .catch((error) => {
          console.error("Erro ao buscar produtos:", error);
        });
    },
    salvarEdicao() {
      this.$refs.formEditar.validate().then((isValid) => {
        if (!isValid) return;

        api
          .put(
            `http://localhost:8000/api/cozinha/produto/${this.editItem.id}`,
            {
              data: this.editItem.data,
              produto_id: this.editItem.produto_id,
              quantidade: Number(this.editItem.quantidade),
              descricao: this.editItem.descricao,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
          .then(() => {
            this.dialogEditar = false;
            this.atualizarProdutosEdicao();
          })
          .catch((error) => {
            console.error("Erro ao editar produto:", error);
          });
      });
    },
    confirmarExclusao() {
      api
        .delete(
          `http://localhost:8000/api/cozinha/produto/${this.deleteItem.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then(() => {
          this.dialogExcluir = false;
          this.atualizarProdutosEdicao();
        })
        .catch((error) => {
          console.error("Erro ao excluir produto:", error);
        });
    },
    adicionarItem() {
      this.$refs.formAdicionar.validate().then((isValid) => {
        if (!isValid) return;

        api
          .post(
            "http://localhost:8000/api/cozinha/produto",
            {
              data: this.novoProduto.data,
              produto_id: this.novoProduto.produto_id,
              quantidade: this.novoProduto.quantidade,
              descricao: this.novoProduto.descricao,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
          .then(() => {
            return api.get("http://localhost:8000/api/cozinha/produto", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
          })
          .then((response) => {
            this.produtosListar = response.data.sort((a, b) => {
              return new Date(b.data) - new Date(a.data);
            });
            this.dialogAdicionar = false;

            this.novoProduto = {
              data: "",
              produto_id: null,
              quantidade: null,
              descricao: "",
            };
          })
          .catch((error) => {
            console.error("Erro ao adicionar item:", error.response?.data);
          });
      });
    },
    atualizarQuantidadeMaxima(id) {
      const produto = this.produtosDisponiveis.find((p) => p.id === id);
      this.quantidadeMaxima = produto ? produto.quantidade : null;
    },
  },
  mounted() {
    this.atualizarProdutosEdicao();

    api
      .get("http://localhost:8000/api/cozinha/cadproduto", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then((response) => {
        this.produtosDisponiveis = response.data;
      })
      .catch((error) => {
        console.error("Erro ao buscar produtos disponíveis:", error);
      });
  },
};
</script>
