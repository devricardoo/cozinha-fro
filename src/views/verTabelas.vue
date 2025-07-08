<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col>
          <v-card
            class="mx-auto flat"
            max-width="660"
            style="border: none; box-shadow: none"
          >
            <div class="d-flex justify-between align-center" style="gap: 350px">
              <v-text-field
                v-model="searchInput"
                label="Pesquisar"
                append-icon="mdi-magnify"
                hide-details
                density="compact"
                class="mb-1"
                @click:append="pesquisar"
                @keyup.enter="pesquisar"
                style="max-width: 200px; font-size: 13px"
              ></v-text-field>
              <v-card class="flat border" width="100">
                <div>
                  <v-btn
                    color="#4db6ac"
                    variant="text"
                    size="small"
                    class="mt-1"
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
                  <th>
                    <v-btn variant="text" @click="downloadXLSX(item)">
                      <v-icon>mdi-download</v-icon>
                    </v-btn>
                  </th>
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
                  <td></td>
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
              :rules="rulesAdicionar.date"
              type="date"
              required
            ></v-text-field>

            <v-autocomplete
              v-model="novoProduto.produto_id"
              :items="produtosOrdenados"
              item-value="value"
              item-title="text"
              label="Selecionar produto"
              :rules="rulesAdicionar.produto"
              append-inner-icon="mdi-magnify"
              density="compact"
              required
              class="mb-5"
              @update:modelValue="
                (val) => {
                  atualizarQuantidadeMaxima(val);
                }
              "
              style="height: 50px"
            >
              <template #no-data>
                <div class="pa-2 text-caption" style="color: #b00020">
                  Produto não encontrado
                </div>
              </template>
            </v-autocomplete>

            <v-text-field
              v-model="novoProduto.quantidade"
              label="Quantidade"
              :rules="regrasQuantidadeAdicionar"
              type="number"
              required
            ></v-text-field>

            <v-text-field
              v-model="novoProduto.descricao"
              label="Descrição"
              :rules="rulesAdicionar.descricao"
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
          <v-btn text @click="fecharAdicionar">Cancelar</v-btn>
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
              v-model="editItem.data"
              :rules="rulesEditar.date"
              label="Data"
              type="date"
            ></v-text-field>
            <v-select
              v-model="editItem.produto_id"
              :items="produtosOrdenados"
              :rules="rulesEditar.produto"
              item-value="value"
              item-title="text"
              label="Produto"
              @update:modelValue="
                (val) => {
                  atualizarQuantidadeMaxima(val);
                }
              "
              required
            >
            </v-select>

            <v-text-field
              v-model="editItem.quantidade"
              :rules="regrasQuantidadeEditar"
              label="Quantidade"
              type="number"
            ></v-text-field>

            <v-text-field
              v-model="editItem.descricao"
              :rules="rulesEditar.descricao"
              label="Descrição"
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
      quantidadeMinimaAdicionar: null,
      quantidadeMaximaAdicionar: null,
      quantidadeMinimaEditar: null,
      quantidadeMaximaEditar: null,
      rulesAdicionar: {
        date: dateRules,
        produto: [
          (value) => !!value || "Escolha um produto",
          (value) => {
            const existe = this.produtosListar.some(
              (item) => item.produto_id === value
            );
            return !existe || "Este produto já foi adicionado";
          },
        ],
        quantidade: [
          (value) => !!value || "A quantidade é obrigatória",
          (value) => value > 0 || "A quantidade deve ser maior que zero",
          (value) =>
            this.quantidadeMinimaAdicionar == null ||
            value >= this.quantidadeMinimaAdicionar ||
            `A quantidade deve ser no mínimo ${this.quantidadeMinimaAdicionar}`,
          (value) =>
            this.quantidadeMaximaAdicionar == null ||
            value <= this.quantidadeMaximaAdicionar ||
            `A quantidade deve ser no máximo ${this.quantidadeMaximaAdicionar}`,
        ],
        descricao: descricaoRules,
      },
      rulesEditar: {
        date: dateRules,
        produto: [
          (value) => !!value || "Escolha um produto",
          (value) => {
            const existe = this.produtosListar.some(
              (item) =>
                item.produto_id === value && item.id !== this.editItem.id
            );
            return !existe || "Este produto já foi adicionado";
          },
        ],
        descricao: descricaoRules,
      },
      search: "",
      searchInput: "",
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
        quantidade_minima: null,
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
    regrasQuantidadeAdicionar() {
      return [
        (value) => !!value || "A quantidade é obrigatória",
        (value) => value > 0 || "A quantidade deve ser maior que zero",
        (value) =>
          this.quantidadeMinimaAdicionar == null ||
          value >= this.quantidadeMinimaAdicionar ||
          `A quantidade deve ser no mínimo ${this.quantidadeMinimaAdicionar}`,
        (value) =>
          this.quantidadeMaximaAdicionar == null ||
          value <= this.quantidadeMaximaAdicionar ||
          `A quantidade deve ser no máximo ${this.quantidadeMaximaAdicionar}`,
      ];
    },
    regrasQuantidadeEditar() {
      return [
        (v) => !!v || "A quantidade é obrigatória.",
        (v) => v > 0 || "A quantidade deve ser maior que zero.",
        (v) =>
          this.quantidadeMinimaEditar == null ||
          v >= this.quantidadeMinimaEditar ||
          `A quantidade deve ser no mínimo ${this.quantidadeMinimaEditar}`,
        (v) =>
          this.quantidadeMaximaEditar == null ||
          v <= this.quantidadeMaximaEditar ||
          `A quantidade deve ser no mãximo ${this.quantidadeMaximaEditar}`,
      ];
    },
    produtosOrdenados() {
      return this.produtosFormatados.sort((a, b) =>
        a.text.localeCompare(b.text)
      );
    },
    produtosFormatados() {
      return this.produtosDisponiveis.map((item) => ({
        text: item.produto_nome,
        value: item.id,
      }));
    },
    produtosFiltrados() {
      if (!this.search) return this.produtosListar;

      const texto = this.search.toLowerCase();

      return this.produtosListar.filter((item) => {
        const nomeProduto = item.produto?.produto_nome?.toLowerCase() || "";
        const data = item.data?.toLowerCase() || "";
        return nomeProduto.includes(texto) || data.includes(texto);
      });
    },
    produtosPaginados() {
      const produtosParaPaginacao = this.search
        ? this.produtosFiltrados
        : this.produtosListar;
      const start = (this.page - 1) * this.itemsPerPage;
      return produtosParaPaginacao.slice(start, start + this.itemsPerPage);
    },
    pageCount() {
      const produtosParaPaginacao = this.search
        ? this.produtosFiltrados
        : this.produtosListar;
      return Math.ceil(produtosParaPaginacao.length / this.itemsPerPage);
    },
  },
  methods: {
    async downloadXLSX(item) {
      try {
        const produtosExportar = this.search
          ? this.produtosFiltrados
          : this.produtosListar;

        const produtosData = produtosExportar.map((p) => ({
          data: p.data,
          produto_nome: p.produto.produto_nome,
          quantidade: p.quantidade,
          descricao: p.descricao,
        }));
        const response = await api.get(
          `http://localhost:8000/api/cozinha/tarefas/exportacao`,
          {
            responseType: "blob",
            params: {
              produtos: produtosData,
            },
          }
        );

        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute("download", "lista_de_produtos.xlsx");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Erro ao baixar o arquivo:", error);
      }
    },
    pesquisar() {
      this.search = this.searchInput;
      this.page = 1;
    },
    formatarData(data) {
      if (!data) return "";
      return new Date(data + "T00:00:00").toLocaleDateString("pt-BR");
    },
    abrirAdicionar() {
      this.dialogAdicionar = true;
    },
    abrirEdicao(item, index) {
      this.editItem = { ...item };
      this.editIndex = index;

      const produtoOriginal = this.produtosDisponiveis.find(
        (p) => p.id === item.produto_id
      );

      this.quantidadeMinimaEditar = produtoOriginal?.quantidade_minima ?? null;
      this.quantidadeMaximaEditar = produtoOriginal?.quantidade ?? null;

      this.dialogEditar = true;
    },
    abrirExclusao(item, index) {
      this.deleteItem = JSON.parse(JSON.stringify(item));
      this.deleteIndex = index;
      this.dialogExcluir = true;
    },
    fecharAdicionar() {
      this.dialogAdicionar = false;
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
      this.$refs.formEditar.validate().then((resultado) => {
        if (!resultado.valid) return;

        api
          .put(
            `http://localhost:8000/api/cozinha/produto/${this.editItem.id}`,
            {
              data: this.editItem.data,
              produto_id: this.editItem.produto_id,
              quantidade: this.editItem.quantidade,
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
      this.$refs.formAdicionar.validate().then((resultado) => {
        if (!resultado.valid) return;

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

      if (produto) {
        if (this.dialogAdicionar) {
          this.quantidadeMaximaAdicionar = produto.quantidade;
          this.quantidadeMinimaAdicionar = produto.quantidade_minima;
        }

        if (this.dialogEditar) {
          this.quantidadeMaximaEditar = produto.quantidade;
          this.quantidadeMinimaEditar = produto.quantidade_minima;
        }
      } else {
        if (this.dialogAdicionar) {
          this.quantidadeMaximaAdicionar = null;
          this.quantidadeMinimaAdicionar = null;
        }
        if (this.dialogEditar) {
          this.quantidadeMaximaEditar = null;
          this.quantidadeMinimaEditar = null;
        }
      }
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
