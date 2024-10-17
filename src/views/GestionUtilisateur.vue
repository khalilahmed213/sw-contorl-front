<template>
  <v-container>
    <v-card elevation="1">
      <v-row align="center" class="mb-4">
        <v-col cols="6" class="text-left">
          <v-btn @click="exportToExcel" class="ml-auto" color="green"
          >Export Excel</v-btn
        >
        </v-col>
        <v-col cols="6" class="text-right">
          <v-btn color="primary" @click="openDialog('add')">
            Ajouter Agent
          </v-btn>
        </v-col>
      </v-row>

      <v-data-table-server
        :headers="headers"
        :items="agents"
        :items-length="total"
        :loading="loadingagent"
        @update:options="fetchAgents"
      >
        <template v-slot:top>
          <v-toolbar flat>
          
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Rechercher"
              single-line
              hide-details
              @input="debouncedSearch"
            ></v-text-field>
          </v-toolbar>
        </template>

        <template v-slot:item.actions="{ item }">
          <v-icon size="small" class="me-2" @click="openDialog('view', item)">
            mdi-eye
          </v-icon>
          <v-icon size="small" class="me-2" @click="openDialog('edit', item)">
            mdi-pencil
          </v-icon>
          <v-icon size="small" class="me-2" @click="openDeleteConfirmation(item.id)">
            mdi-delete
          </v-icon>
          <v-icon size="small" @click="resetPassword(item.email)" :disabled="loadingagent">
            mdi-lock-reset
          </v-icon>
        </template>
      </v-data-table-server>

      <v-dialog v-model="dialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ dialogTitle }}</span>
          </v-card-title>
          <v-card-text>
            <template v-if="isViewMode">
              <v-list>
                <v-list-item v-for="(value, key) in translatedViewedAgent" :key="key">
                  <v-list-item-title>{{ key }} :</v-list-item-title>
                  <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </template>
            <v-form v-else ref="form" v-model="valid">
              <v-text-field
                v-model="editedAgent.name"
                label="Agent"
                :rules="[(v) => !!v || 'Agent requis']"
              ></v-text-field>
              <v-text-field
                v-model="editedAgent.email"
                label="Email"
                :rules="[
                  (v) => !!v || 'Email requis',
                  (v) => isValidEmail(v) || 'Email invalide',
                ]"
              ></v-text-field>
              <v-text-field
                v-model="editedAgent.UserInfo.months"
                label="Nombre de mois"
                type="number"
                :rules="[
                  (v) => !!v || 'Nombre de mois requis',
                  (v) => v > 0 || 'Nombre de mois doit être supérieur à 0',
                ]"
              ></v-text-field>
              <v-text-field
                v-if="!isEditMode"
                v-model="editedAgent.password"
                label="Mot de passe"
                type="password"
                :rules="[(v) => !!v || 'Mot de passe requis']"
              ></v-text-field>
              <v-text-field
                v-model="editedAgent.phoneNumber"
                label="Numéro de téléphone"
                :rules="[
                  (v) => !!v || 'Numéro de téléphone requis',
                  (v) =>
                    /^\d{8}$/.test(v) ||
                    'Numéro de téléphone invalide (8 chiffres)',
                ]"
              ></v-text-field>
              <v-text-field
                v-model="editedAgent.address"
                label="Adresse"
                :rules="[(v) => !!v || 'Adresse requise']"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="closeDialog">
              {{ isViewMode ? 'Fermer' : 'Annuler' }}
            </v-btn>
            <v-btn
              v-if="!isViewMode"
              color="blue-darken-1"
              variant="text"
              @click="saveAgent"
              :disabled="!valid"
            >
              Enregistrer
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="confirmDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h5">Confirmation</v-card-title>
          <v-card-text>
            Êtes-vous sûr de vouloir supprimer cet agent ?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue-darken-1" variant="text" @click="confirmDelete">Oui</v-btn>
            <v-btn color="blue-darken-1" variant="text" @click="cancelDelete">Non</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
        {{ snackbarText }}
        <template v-slot:actions>
          <v-btn color="white" text @click="snackbar = false">
            Fermer
          </v-btn>
        </template>
      </v-snackbar>
    </v-card>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import debounce from 'lodash/debounce';

export default {
  data() {
    return {
      form: null,
      search: '',
      options: {},
      valid: false,
      dialog: false,
      dialogTitle: '',
      confirmDialog: false,
      isEditMode: false,
      isViewMode: false,
      viewedAgent: {},
      selectedAgentId: null,
      headers: [
        { title: "Agent", align: "start", key: "name" },
        { title: "Email", key: "email" },
        { title: "Nombre de mois", key: "UserInfo.months" },
        { title: "Numéro de téléphone", key: "phoneNumber" },
        { title: "Adresse", key: "address" },
        { title: "Actions", key: "actions", sortable: false },
      ],
      editedAgent: {
        id: null,
        name: "",
        email: "",
        password: "",
        months: 0,
        phoneNumber: "",
        address: "",
        role: "employe",
      },
      defaultAgent: {
        id: null,
        name: "",
        email: "",
        password: "",
        UserInfo: {
        months: ""
    },
        phoneNumber: "",
        address: "",
        role: "employe",
      },
      snackbar: false,
      snackbarText: '',
      snackbarColor: 'success',
    };
  },
  computed: {
    ...mapGetters('agent', ['agents', 'loadingagent', 'total']),
    translatedViewedAgent() {
      const translations = {
        name: 'Nom',
        email: 'Email',
        months: 'Nombre de mois',
        phoneNumber: 'Numéro de téléphone',
        address: 'Adresse',
        role: 'Rôle'
      };
      
      return Object.entries(this.viewedAgent).reduce((acc, [key, value]) => {
        if (translations[key]) {
          acc[translations[key]] = value;
        }
        return acc;
      }, {});
    }
  },
  methods: {
    debouncedSearch: debounce(function() {
      this.fetchAgents();
    }, 300),
    async fetchAgents(newOptions) {
      if (newOptions) {
        this.options = newOptions;
      }
      const { page, itemsPerPage, sortBy, sortDesc } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : 'name';
      const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : 'asc';

      await this.$store.dispatch('agent/fetchAgents', {
        page: page || 1,
        limit: itemsPerPage || 10,
        sortBy: sortKey,
        sortDesc: sortOrder === 'desc',
        search: this.search
      });
    },
    openDialog(action, agent = null) {
      this.isEditMode = action === "edit";
      this.isViewMode = action === "view";
      if (action === "add") {
        this.dialogTitle = "Ajouter Agent";
        this.editedAgent = { ...this.defaultAgent };
      } else if ((action === "edit" || action === "view") && agent) {
        this.dialogTitle = action === "edit" ? "Modifier Agent" : "Détails de l'Agent";
        if (action === "view") {
          this.viewedAgent = { ...agent };
        } else {
          this.editedAgent = { ...agent };
          console.log(this.editedAgent)
        }
      } else if ((action === "edit" || action === "view") && !agent) {
        console.error(`Attempted to ${action} an undefined agent`);
        return;
      }
      this.dialog = true;
    },
    closeDialog() {
      this.dialog = false;
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
    },
    async saveAgent() {
      if (this.$refs.form && this.$refs.form.validate()) {
        if (this.editedAgent.id) {
          try {
            const agentToUpdate = { ...this.editedAgent };
            delete agentToUpdate.password;
            await this.$store.dispatch('agent/updateAgent', agentToUpdate);
            this.fetchAgents();
            this.closeDialog();
            this.showSnackbar('Agent mis à jour avec succès', 'success');
          } catch (error) {
            console.error("Error updating agent:", error);
            this.showSnackbar('Erreur lors de la mise à jour de l\'agent', 'error');
          }
        } else {
          try {
            await this.$store.dispatch('agent/createAgent', this.editedAgent);
            this.fetchAgents();
            this.closeDialog();
            this.showSnackbar('Agent ajouté avec succès', 'success');
          } catch (error) {
            console.error("Error creating agent:", error);
            this.showSnackbar('Erreur lors de l\'ajout de l\'agent', 'error');
          }
        }
      }
    },
    openDeleteConfirmation(id) {
      if (id) {
        this.selectedAgentId = id;
        this.confirmDialog = true;
      } else {
        console.error("Attempted to delete an undefined agent");
      }
    },
    cancelDelete() {
      this.confirmDialog = false;
      this.selectedAgentId = null;
    },
    async confirmDelete() {
      if (this.selectedAgentId) {
        try {
          await this.$store.dispatch('agent/deleteAgent', this.selectedAgentId);
          this.fetchAgents();
          this.showSnackbar('Agent supprimé avec succès', 'success');
        } catch (error) {
          console.error("Error deleting agent:", error);
          this.showSnackbar('Erreur lors de la suppression de l\'agent', 'error');
        }
        this.confirmDialog = false;
        this.selectedAgentId = null;
      }
    },
    async resetPassword(email) {
     
      try {
       await this.$store.dispatch('auth/forgotPassword', email); 
        alert("email de réinisialisation est envoyé à"+email);
      } catch (error) {
        console.error("Error resetting password:", error);
      }
    },
    exportTableToExcel() {
      const ws = XLSX.utils.json_to_sheet(this.agents.map(agent => ({
        "Agent": agent.name,
        "Email": agent.email,
        "Nombre de mois": agent.months,
        "Numéro de téléphone": agent.phoneNumber,
        "Adresse": agent.address,
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Agents");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), "agents.xlsx");
    },
    isValidEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    },
    showSnackbar(text, color = 'success') {
      this.snackbarText = text;
      this.snackbarColor = color;
      this.snackbar = true;
    },
  },
  mounted() {
  },
};
</script>

<style scoped>
.text-right {
  text-align: right;
}

.text-left {
  text-align: left;
}
</style>