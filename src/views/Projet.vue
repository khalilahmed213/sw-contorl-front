<template>
  <v-container>
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <div>
          <v-btn color="primary" @click="openAddDialog" class="mr-2">
            <v-icon left>mdi-plus</v-icon>
            Ajouter Projet
          </v-btn>
          <v-btn @click="exportToExcel" class="ml-auto" color="green"
          >Export Excel</v-btn
        >
        </div>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Rechercher"
          single-line
          hide-details
          style="max-width: 300px"
          @input="debouncedSearch"
        ></v-text-field>
      </v-card-title>

      <v-card-content>
        <v-data-table-server
          v-model:items-per-page="options.itemsPerPage"
          :headers="headers"
          :items="allProjects"
          :items-length="totalCount"
          :loading="loadingproj"
          :search="search"
          item-value="name"
          @update:options="fetch"
          class="elevation-1"
        >
          <template v-slot:item.description="{ item }">
            <div v-if="item.description">
              {{
                item.description.length > 60
                  ? item.description.slice(0, 60) + "..."
                  : item.description
              }}
              <span
                v-if="item.description.length > 60"
                class="read-more"
                @click="viewDescription(item)"
              >
                Lire la suite
              </span>
            </div>
            <div v-else>Pas de description</div>
          </template>
          <template v-slot:item.actions="{ item, index }">
            <v-icon small @click="viewDetails(item)" class="mr-2">mdi-eye</v-icon>
            <v-icon small @click="editProject(index)" class="mr-2">mdi-pencil</v-icon>
            <v-icon small @click="deleteProjectOld(index)" color="black">mdi-delete</v-icon>
          </template>
        </v-data-table-server>
      </v-card-content>
    </v-card>

    <!-- Add/Edit Project Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{
          isEditing ? "Modifier Projet" : "Ajouter Projet"
        }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedProject.name"
            label="Nom du Projet"
            required
          ></v-text-field>
          <v-textarea
            v-model="editedProject.description"
            label="Description"
            required
          ></v-textarea>
          <v-select
            v-model="editedProject.userIds"
            :items="allAgents"
            item-title="name"
            item-value="id"
            label="agents"
            :loading="loading"
            required
            multiple
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="saveProject"
            :disabled="!isFormValid"
            >{{ isEditing ? "Sauvegarder" : "Ajouter" }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="confirmDeleteDialog" max-width="500px">
      <v-card>
        <v-card-title>Confirmer la suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer ce projet ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeConfirmDeleteDialog"
            >Annuler</v-btn
          >
          <v-btn color="red" text @click="confirmDelete">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="viewDialog" max-width="500px">
      <v-card>
        <v-card-title>Description complète</v-card-title>
        <v-card-text>
          <p>{{ viewedProjectDescription }}</p>
          <v-chip-group column> </v-chip-group>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeViewDialog"
            >Fermer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600px">
      <v-card>
        <v-card-title>Détails du Projet</v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item>
              <v-list-item-title>Nom du Projet:</v-list-item-title>
              <v-list-item-subtitle>{{ viewedProject.name }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Description:</v-list-item-title>
              <v-list-item-subtitle>{{ viewedProject.description }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Agents:</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip v-for="user in viewedProject.Users" :key="user.id" class="mr-2 mb-2">
                  {{ user.name }}
                </v-chip>
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="closeDetailsDialog">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar v-model="snackbar" :timeout="3000" color="success">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn color="white" text @click="snackbar = false">Fermer</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import debounce from "lodash/debounce";
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      UserIds: [],
      search: "",
      dialog: false,
      confirmDeleteDialog: false,
      isEditing: false,
      editedIndex: -1,
      editedProject: {},
      projectToDeleteIndex: -1,
      headers: [
        { title: "Nom du Projet", align: "start", key: "name" },
        { title: "description", key: "description", align: "start" },
        { title: "Actions", key: "actions", sortable: false },
      ],
      viewedProjectDescription: "",
      viewedProjectUsers: [],
      viewDialog: false,
      options: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
      },
      totalProjects: 0,
      debouncedSearch: null, // We'll initialize this in created()
      snackbar: false,
      snackbarMessage: '',
      detailsDialog: false,
      viewedProject: {},
    };
  },

  created() {},
  computed: {
    ...mapGetters("projects", ["allProjects", "loadingproj", "totalCount"]),
    ...mapGetters("agent", ["allAgents", "loading"]),
    isFormValid() {
      return (
        this.editedProject.name &&
        this.editedProject.description &&
        this.editedProject.UserId !== null
      );
    },
  },
  methods: {
    ...mapActions("projects", [
      "fetchProjects",
      "addProject",
      "updateProject",
      "deleteProject",
    ]),
    ...mapActions("agent", ["fetchAllAgents"]),
    openAddDialog() {
      this.isEditing = false;
      this.editedProject = { name: "", description: "", UserIds: null }; // Reset with default value
      this.dialog = true;
    },
    editProject(index) {
      this.isEditing = true;
      this.editedIndex = index;
      const project = { ...this.allProjects[index] };
      this.editedProject = {
        id: project.id,
        name: project.name,
        description: project.description,
        userIds: project.Users.map((user) => user.id),
      };
      this.dialog = true;
    },
    async saveProject() {
      try {
        if (!this.isFormValid) {
          return;
        }
        if (this.isEditing) {
          await this.updateProject(this.editedProject);
          this.showSuccessMessage('Projet mis à jour avec succès');
        } else {
          await this.addProject(this.editedProject);
          this.showSuccessMessage('Projet ajouté avec succès');
        }
        await this.fetchProjects(this.options);
        this.closeDialog();
      } catch (error) {
        console.error("Failed to save project:", error);
      }
    },
    closeDialog() {
      this.dialog = false; // Reset with default value
      this.editedIndex = -1;
    },
    async deleteProjectOld(index) {
      this.projectToDeleteIndex = index;
      this.confirmDeleteDialog = true;
    },
    debouncedSearch() {
      return debounce(async () => {
        await this.fetchProjects(this.options);
      }, 300);
    },
    async confirmDelete() {
      if (
        this.projectToDeleteIndex >= 0 &&
        this.projectToDeleteIndex < this.allProjects.length
      ) {
        const projectId = this.allProjects[this.projectToDeleteIndex].id;
        await this.deleteProject(projectId);
        await this.fetchProjects(this.options);
        this.closeConfirmDeleteDialog();
        this.showSuccessMessage('Projet supprimé avec succès');
      } else {
        console.error("Invalid project index");
        this.closeConfirmDeleteDialog();
      }
    },
    closeConfirmDeleteDialog() {
      this.confirmDeleteDialog = false;
      this.projectToDeleteIndex = -1;
    },
    viewDescription(item) {
      this.viewedProjectDescription = item.description;
      this.viewedProjectUsers = item.Users;
      this.viewDialog = true;
    },
    closeViewDialog() {
      this.viewDialog = false;
    },

    async fetch(newOptions) {
      if (newOptions) {
        this.options = newOptions;
      }
      const { page, itemsPerPage, sortBy, sortDesc } = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : "name";
      const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : "asc";

      await this.fetchProjects({
        page: page,
        limit: itemsPerPage,
        sortBy: sortKey,
        sortDesc: sortOrder === "desc",
        search: this.search,
      });
    },

    showSuccessMessage(message) {
      this.snackbarMessage = message;
      this.snackbar = true;
    },

    async exportToExcel() {
      try {
        // Fetch all projects data (you might need to adjust this based on your API)
        const projectsData = this.allProjects.map(project => ({
          'Nom du Projet': project.name,
          'Description': project.description,
          'Agents': project.Users.map(user => user.name).join(', ')
        }));

        const worksheet = XLSX.utils.json_to_sheet(projectsData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Projets");
        
        XLSX.writeFile(workbook, "projets_export.xlsx");

        this.showSuccessMessage('Export Excel réussi');
      } catch (error) {
        console.error("Failed to export projects:", error);
        // You might want to show an error message to the user here
      }
    },

    viewDetails(item) {
      this.viewedProject = { ...item };
      this.detailsDialog = true;
    },
    
    closeDetailsDialog() {
      this.detailsDialog = false;
      this.viewedProject = {};
    },

  },
  watch: {
    itemsPerPage(newVal, oldVal) {
      
      this.fetch(); // You can trigger data fetching based on the updated items per page
    },
  },
  async mounted() {
    await this.fetchAllAgents();
  },
};
</script>

<style scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.read-more {
  color: #1976d2; /* Primary color or any color you prefer */
  cursor: pointer;
  font-weight: bold;
}
.read-more:hover {
  text-decoration: underline;
}
</style>
