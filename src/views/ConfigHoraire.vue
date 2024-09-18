<template>
  <v-container>
    <v-btn color="primary" @click="openDialog">Ajouter Horaire</v-btn>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title
          >{{ editedIndex === -1 ? "Créer" : "Modifier" }} Horaire</v-card-title
        >
        <v-radio-group
          v-model="editedSchedule.isRecurring"
          @change="toggleBool"
        >
          <v-radio :value="true" label="Récurrent"></v-radio>
          <v-radio :value="false" label="Séance Unique"></v-radio>
        </v-radio-group>
        <v-card-text>
          <!-- Schedule Name -->
          <v-text-field
            v-model="editedSchedule.name"
            label="Nom de l'Horaire"
          ></v-text-field>

          <!-- Morning Schedule -->
          <h3 class="subtitle" v-if="bool">Horaire du Matin</h3>
          <v-row v-if="bool">
            <v-col cols="6">
              <v-text-field
                v-model="editedSchedule.morningStart"
                label="Début"
                type="time"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="editedSchedule.morningEnd"
                :min="editedSchedule.morningStart"
                label="Fin"
                type="time"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Break Schedule -->
          <h3 v-if="bool" class="subtitle">Pause</h3>
          <v-row v-if="bool">
            <v-col cols="6">
              <v-text-field
                v-model="editedSchedule.breakStart"
                :min="editedSchedule.morningEnd"
                label="Début"
                type="time"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="editedSchedule.breakEnd"
                :min="editedSchedule.breakStart"
                label="Fin"
                type="time"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Afternoon Schedule -->
          <h3 class="subtitle" v-if="bool">Horaire de l'Après-midi</h3>
          <v-row v-if="bool">
            <v-col cols="6">
              <v-text-field
                v-model="editedSchedule.afternoonStart"
                :min="editedSchedule.breakEnd"
                label="Début"
                type="time"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="editedSchedule.afternoonEnd"
                :min="editedSchedule.afternoonStart"
                label="Fin"
                type="time"
              ></v-text-field>
            </v-col>
          </v-row>
          <h3 class="subtitle" v-if="!bool">Horaires</h3>
          <v-row v-if="!bool">
            <v-col cols="6">
              <v-text-field
                v-model="editedSchedule.morningStart"
                label="Début"
                type="time"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="editedSchedule.morningEnd"
                label="Fin"
                type="time"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-text-field
                v-model="editedSchedule.startDate"
                label="Date Début"
                type="date"
              ></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field
                v-model="editedSchedule.endDate"
                label="Date Fin"
                type="date"
              ></v-text-field>
            </v-col>
          </v-row>
          <!-- Recurring or Single Session Selection -->
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
          <v-btn
            color="blue darken-1"
            text
            @click="saveEditedSchedule"
            :disabled="!isFormValid"
            >{{ editedIndex === -1 ? "Créer" : "Modifier" }}</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Schedules List Card -->
    <v-card>
      <v-card-title> Liste des Horaires </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :loading="isLoading"
          :items="getSchedules"
          class="elevation-1"
        >
          <template v-slot:item.checkbox="{ item }">
            <v-checkbox
              v-model="item.isSelected"
              @change="toggleSelectedvue(item)"
              :disabled="item.isSelected"
            ></v-checkbox>
          </template>
          <template v-slot:item.schedule="{ item }">
            <div v-if="item.isRecurring">
              <span>
                Date début: {{ item.startDate }} à Date fin: {{ item.endDate }}<br>
                Heure Début: {{ item.morningStart }} -Heure Fin: {{ item.afternoonEnd }} -
                Pause: {{ item.breakStart }} à {{ item.breakEnd }}
              </span>
            </div>
            <div v-else>
              <span>
                Date début: {{ item.startDate }} à Date fin: {{ item.endDate }}<br>
               Heure Début: {{ item.morningStart }} - Heure Fin: {{ item.morningEnd }} - sans Pause
              </span>
            </div>
          </template>
          <template v-slot:item.actions="{ item }">
            <div v-if="!load && !isLoading"> <!-- Removed isSelected check -->
              <v-icon small @click="editSchedule(item)">mdi-pencil</v-icon>
              <v-icon small @click="confirmDelete(item)">mdi-delete</v-icon>
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Popup -->
    <v-dialog v-model="popupVisible" max-width="300px">
      <v-card>
        <v-card-title>{{ selectedSchedule?.name }} sélectionné</v-card-title>
        <v-card-text>
          L'horaire "{{ selectedSchedule?.name }}" a été sélectionné.
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="popupVisible = false"
            >Fermer</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" text @click="snackbar.show = false">
          Fermer 
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Confirm Delete Dialog -->
    <v-dialog v-model="confirmDeleteDialog" max-width="300px">
      <v-card>
        <v-card-title>Confirmation de Suppression</v-card-title>
        <v-card-text>
          Êtes-vous sûr de vouloir supprimer cet horaire ?
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="confirmDeleteDialog = false">Annuler</v-btn>
          <v-btn color="red" text @click="deleteScheduleConfirmed">Supprimer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      dialog: false,
      editedIndex: -1,
      editedSchedule: {
        name: "",
        startDate: "",
        endDate: "",
        morningStart: "",
        morningEnd: "",
        breakStart: "",
        breakEnd: "",
        afternoonStart: "",
        afternoonEnd: "",
        isRecurring: true,
        isSelected: false,
      },
      load: null,
      headers: [
        { title: "Checkbox", key: "checkbox", sortable: false },
        { title: "Nom de l'Horaire", align: "start", key: "name" },
        { title: "Horaires", align: "start", key: "schedule" },
        { title: "Actions", key: "actions", sortable: false },
      ],
      bool: true,
      selectedSchedule: null,
      popupVisible: false,
      snackbar: {
        show: false,
        message: '',
        color: 'success'
      },
      response:null,
      confirmDeleteDialog: false, // New data property for delete confirmation dialog
      scheduleToDelete: null, // Store the schedule to delete
    };
  },
  computed: {
    ...mapGetters(["getSchedules", "isLoading"]),
    isFormValid() {
      if (this.editedSchedule.isRecurring) {
        return (
          this.editedSchedule.name &&
          this.editedSchedule.startDate &&
          this.editedSchedule.endDate &&
          this.editedSchedule.morningStart &&
          this.editedSchedule.morningEnd &&
          this.editedSchedule.breakStart &&
          this.editedSchedule.breakEnd &&
          this.editedSchedule.afternoonStart &&
          this.editedSchedule.afternoonEnd
        );
      } else {
        return (
          this.editedSchedule.name &&
          this.editedSchedule.startDate &&
          this.editedSchedule.endDate &&
          this.editedSchedule.morningStart &&
          this.editedSchedule.morningEnd
        );
      }
    },
  },

  methods: {
    ...mapActions([
      "fetchSchedules",
      "createSchedule",
      "updateSchedule",
      "deleteSchedule",
      "toggleSelected",
    ]),
    openDialog() {
      this.dialog = true;
      this.bool = this.editedSchedule.isRecurring;
    },
    editSchedule(item) {
      this.editedIndex = this.getSchedules.indexOf(item);
      this.editedSchedule = { ...item };
      this.dialog = true;
      this.bool = this.editedSchedule.isRecurring;
    },
    async saveEditedSchedule() {
        if (this.editedIndex > -1) {
        this.response = await this.updateSchedule(this.editedSchedule);
        } else {
        this.response = await this.createSchedule(this.editedSchedule);
        }
        this.showSnackbar(this.response.message, this.response.success ? 'success' : 'error');
      await this.fetchSchedules();
      this.closeDialog();
    },
    closeDialog() {
      this.dialog = false;
      this.resetForm();
    },
    resetForm() {
      this.editedSchedule = {
        name: "",
        morningStart: "",
        morningEnd: "",
        breakStart: "",
        breakEnd: "",
        afternoonStart: "",
        afternoonEnd: "",
        isRecurring: true,
        isSelected: false,
      };
      this.bool = true;
      this.editedIndex = -1;
    },
    toggleBool() {
      this.bool = this.editedSchedule.isRecurring;
    },
    showPopup(item) {
      this.load = false;
      this.selectedSchedule = item;
      this.popupVisible = true;
    },
    confirmDelete(item) {
      this.scheduleToDelete = item; // Store the item to delete
      this.confirmDeleteDialog = true; // Open the confirmation dialog
    },
   async deleteScheduleConfirmed() {
     this.response= await this.deleteSchedule(this.scheduleToDelete.id);
      this.confirmDeleteDialog = false;
      await this.fetchSchedules();
      this.showSnackbar(this.response.message, this.response.success ? 'success' : 'error');
    
    },
    async toggleSelectedvue(item) {
      try {
        await this.toggleSelected(item.id);
        await this.fetchSchedules();
        this.load = true;
        this.showPopup(item);
      } catch (error) {
        console.error("Error toggling isSelected:", error);
      }
    },
    showSnackbar(message, color = 'success') {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
  watch: {
    "editedSchedule.morningEnd"(newValue) {
      if (
        this.editedSchedule.morningEnd != "" &&
        this.editedSchedule.morningStart > newValue
      ) {
        
        this.editedSchedule.morningEnd = "";
        alert("Respectez l'horaire");
      }
    },
    "editedSchedule.breakStart"(newValue) {
      if (
        this.bool &&
        this.editedSchedule.breakStart != "" &&
        this.editedSchedule.morningEnd > newValue
      ) {
        this.editedSchedule.breakStart = "";
        alert("Respectez l'horaire");
      }
    },
    "editedSchedule.breakEnd"(newValue) {
      if (
        this.editedSchedule.breakEnd != "" &&
        this.editedSchedule.breakStart > newValue
      ) {
        this.editedSchedule.breakEnd = "";
        alert("Respectez l'horaire");

      }
    },
    "editedSchedule.afternoonStart"(newValue) {
      if (
        this.editedSchedule.breakEnd != "" &&
        this.editedSchedule.breakEnd > newValue
      ) {
        this.editedSchedule.afternoonStart = "";
        alert("Respectez l'horaire");
      }
    },
    "editedSchedule.afternoonEnd"(newValue) {
      if (
        this.bool &&
        this.editedSchedule.breakEnd != "" &&
        this.editedSchedule.afternoonStart > newValue
      ) {
       
        this.editedSchedule.afternoonEnd = "";
        alert("Respectez l'horaire");
      }
    },
    "editedSchedule.endDate"(newValue) {
      if (this.editedSchedule.startDate > this.editedSchedule.endDate &&this.editedSchedule.endDate!='') {
       
        this.editedSchedule.endDate = "";
        alert("Respectez l'horaire");
      }
    },
  },
  async mounted() {
    await this.fetchSchedules();
  },
};
</script>

<style scoped>
.subtitle {
  margin-top: 20px;
}
</style>
