<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card
          class="mx-auto flat"
          max-width="470"
          style="border: none; box-shadow: none"
        >
          <div class="d-flex justify-end">
            <v-card class="flat border mb-1" width="100">
              <div>
                <v-btn
                  color="#4db6ac"
                  variant="text"
                  size="small"
                  @click="abrirDialog"
                >
                  Adicionar
                </v-btn>
              </div>
            </v-card>
          </div>

          <v-table density="compact">
            <thead>
              <tr style="background: #4db6ac; color: #fff">
                <th class="text-left">Nome</th>
                <th>E-mail</th>
                <th></th>
              </tr>
            </thead>
            <tbody style="background: #eceff1">
              <tr v-for="(item, index) in user" :key="index">
                <td>{{ item.name }}</td>
                <td>{{ item.email }}</td>
                <td class="text-right">
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
        </v-card>
      </v-col>
    </v-row>
  </v-container>

  <!-- Modal de Adição de usuarios -->
  <v-dialog v-model="dialogAdicionar" max-width="400">
    <v-card>
      <v-card-title class="text-h5 text-center">Cadastrar usuário</v-card-title>
      <v-card-text>
        <v-form ref="formAdicionar" fast-fail @submit.prevent>
          <v-text-field
            v-model="name"
            label="Nome"
            type="text"
            :rules="rules.nome"
            required
          ></v-text-field>

          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            :rules="rules.email"
            required
          ></v-text-field>

          <v-text-field
            v-model="password"
            label="Senha"
            type="password"
            :rules="rules.password"
            required
          ></v-text-field>

          <v-checkbox v-model="is_admin" label="Definir como administrador" />

          <v-btn color="green" class="mt-2" text @click="adicionarUsuario"
            >Registrar</v-btn
          >
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="dialogAdicionar = false">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Modal de Edição de usuarios -->
  <v-dialog v-model="dialogEditar" max-width="400">
    <v-card>
      <v-card-title class="text-h5">Editar usuário</v-card-title>
      <v-card-text>
        <form @submit.prevent>
          <v-text-field
            v-model="editItem.name"
            label="Nome"
            type="text"
          ></v-text-field>
          <v-text-field v-model="editItem.email" label="E-mail" required>
          </v-text-field>

          <v-select
            v-model="editItem.is_admin"
            :items="selectRoles"
            label="Definir como"
            item-title="label"
            item-value="value"
            return-object
          >
            <template v-slot:item="{ item, props }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-checkbox-btn
                    :model-value="editItem.is_admin.value === item.value"
                  />
                </template>
                <v-list-item-title>{{ item.label }}</v-list-item-title>
              </v-list-item>
            </template>
          </v-select>

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
      <v-card-title class="text-h5 mt-2 ml-2">Confirmar Exclusão</v-card-title>
      <v-card-text>
        Tem certeza que deseja excluir o produto
        <strong>{{ deleteItem.name }}</strong
        >?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="grey" text @click="dialogExcluir = false">Cancelar</v-btn>
        <v-btn color="red" text @click="confirmarExclusao">Excluir</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import api from "../axios";

const nomeRules = [
  (value) => !!value || "Informe um nome.",
  (value) => value.length >= 3 || "O nome deve ter pelo menos 3 caracteres.",
];

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
      user: {},
      name: "",
      email: "",
      password: "",
      dialogAdicionar: false,
      dialogEditar: false,
      dialogExcluir: false,
      rules: {
        nome: nomeRules,
        email: emailRules,
        password: passwordRules,
      },
      editItem: {},
      deleteItem: {},
      is_admin: false,
      selectRoles: [
        { label: "Administrador", value: true },
        { label: "Usuário", value: false },
      ],
    };
  },
  methods: {
    abrirDialog() {
      this.dialogAdicionar = true;
    },
    abrirEdicao(item) {
      this.editItem = {
        ...item,
        is_admin: item.is_admin
          ? { label: "Administrador", value: true }
          : { label: "Usuário", value: false },
      };
      this.dialogEditar = true;
    },

    abrirExclusao(item) {
      this.deleteItem = item;
      this.dialogExcluir = true;
    },
    atualizarUsuarios() {
      api
        .get("http://localhost:8000/api/cozinha/users")
        .then((response) => {
          this.user = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
    salvarEdicao() {
      api
        .put(`http://localhost:8000/api/cozinha/users/${this.editItem.id}`, {
          name: this.editItem.name,
          email: this.editItem.email,
          is_admin: this.editItem.is_admin?.value ? 1 : 0,
        })
        .then(() => {
          this.dialogEditar = false;
          this.atualizarUsuarios();
        })
        .catch((error) => {
          console.error("Erro ao editar usuário:", error);
        });
    },
    adicionarUsuario() {
      this.$refs.formAdicionar.validate().then((isValid) => {
        if (!isValid) return;
        api
          .post("http://localhost:8000/api/register", {
            name: this.name,
            email: this.email,
            password: this.password,
            is_admin: this.is_admin ? 1 : 0,
          })
          .then(() => {
            this.dialogAdicionar = false;

            this.name = "";
            this.email = "";
            this.password = "";
            this.is_admin = false;

            this.atualizarUsuarios();
          })
          .catch((error) => console.error("Erro ao registrar:", error));
      });
    },
    confirmarExclusao() {
      api
        .delete(`http://localhost:8000/api/cozinha/users/${this.deleteItem.id}`)
        .then(() => {
          this.dialogExcluir = false;
          this.atualizarUsuarios();
        })
        .catch((error) => {
          console.error("Erro ao excluir produto:", error);
        });
    },
  },
  mounted() {
    this.atualizarUsuarios();
    api
      .get("http://localhost:8000/api/cozinha/users")
      .then((response) => {
        this.user = response.data;
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
</script>
