<template>
  <v-container>
    <v-btn color="primary" @click="openDialog">Ajouter Horaire</v-btn>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>
          {{ editedIndex === -1 ? "Créer" : "Modifier" }} Horaire
        </v-card-title>
        <div v-if="bool">
        <v-form ref="form" v-model="isFormValid" @submit.prevent="saveEditedSchedule">
          <v-card-text>
            <v-radio-group v-model="editedSchedule.isRecurring" @change="toggleBool">
              <v-radio :value="true" label="Récurrent"></v-radio>
              <v-radio :value="false" label="Séance Unique"></v-radio>
            </v-radio-group>
            <v-text-field
              v-model="editedSchedule.name"
              label="Nom de l'Horaire"
              :rules="[v => !!v || 'Le nom est requis']"
            ></v-text-field>
        
            <!-- Morning Schedule -->
            <h3 class="subtitle" >Horaire du Matin</h3>
            <v-row >
              <v-col cols="6">
                <v-text-field
                  v-model="editedSchedule.morningStart"
                  label="Début"
                  type="time"
                  :rules="[ 
                    v => !!v || 'L\'heure de début est requise', 
                    () => validateTimeOrder('morningStart', 'morningEnd') || 'L\'heure de début doit être avant l\'heure de fin' 
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editedSchedule.morningEnd"
                  label="Fin"
                  type="time"
                  :rules="[ 
                    v => !!v || 'L\'heure de fin est requise', 
                    () => validateTimeOrder('morningStart', 'morningEnd') || 'L\'heure de fin doit être après l\'heure de début' 
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Break Schedule -->
            <h3  class="subtitle">Pause</h3>
            <v-row >
              <v-col cols="6">
                <v-text-field
                  v-model="editedSchedule.breakStart"
                  label="Début"
                  type="time"
                  :rules="[ 
                    v => !!v || 'L\'heure de début de pause est requise', 
                    () => validateTimeOrder('morningEnd', 'breakStart') || 'L\'heure de début de pause doit être après la fin du matin', 
                    () => validateTimeOrder('breakStart', 'breakEnd') || 'L\'heure de début de pause doit être avant l\'heure de fin de pause' 
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editedSchedule.breakEnd"
                  label="Fin"
                  type="time"
                  :rules="[ 
                    v => !!v || 'L\'heure de fin de pause est requise', 
                    () => validateTimeOrder('breakStart', 'breakEnd') || 'L\'heure de fin de pause doit être après l\'heure de début de pause', 
                    () => validateTimeOrder('breakEnd', 'afternoonStart') || 'L\'heure de fin de pause doit être avant le début de l\'après-midi' 
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Afternoon Schedule -->
            <h3 class="subtitle" >Horaire de l'Après-midi</h3>
            <v-row >
              <v-col cols="6">
                <v-text-field
                  v-model="editedSchedule.afternoonStart"
                  label="Début"
                  type="time"
                  :rules="[ 
                    v => !!v || 'L\'heure de début de l\'après-midi est requise', 
                    () => validateTimeOrder('breakEnd', 'afternoonStart') || 'L\'heure de début de l\'après-midi doit être après la fin de la pause', 
                    () => validateTimeOrder('afternoonStart', 'afternoonEnd') || 'L\'heure de début de l\'après-midi doit être avant l\'heure de fin' 
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editedSchedule.afternoonEnd"
                  label="Fin"
                  type="time"
                  :rules="[ 
                    v => !!v || 'L\'heure de fin de l\'après-midi est requise', 
                    () => validateTimeOrder('afternoonStart', 'afternoonEnd') || 'L\'heure de fin doit être après l\'heure de début' 
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>

            <!-- Date fields -->
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="editedSchedule.startDate"
                  label="Date Début"
                  type="date"
                  :rules="[ 
                    v => !!v || 'La date de début est requise', 
                    () => validateDateOrder('startDate', 'endDate') || 'La date de début doit être avant ou égale à la date de fin' 
                  ]"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="editedSchedule.endDate"
                  label="Date Fin"
                  type="date"
                  :rules="[ 
                    v => !!v || 'La date de fin est requise', 
                    () => validateDateOrder('startDate', 'endDate') || 'La date de fin doit être après ou égale à la date de début' 
                  ]"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="justify-end"> <!-- Added class to align buttons to the right -->
            <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
            <v-btn
              color="blue darken-1"
              text
              type="submit"
              :disabled="!isFormValid"
            >{{ editedIndex === -1 ? "Créer" : "Modifier" }}</v-btn>
          </v-card-actions>
        </v-form>
      </div>
      <div v-else>
        <v-form ref="form" v-model="isFormValid" @submit.prevent="saveEditedSchedule">
    <v-card-text>
      <v-radio-group v-model="editedSchedule.isRecurring" @change="toggleBool">
        <v-radio :value="true" label="Récurrent"></v-radio>
        <v-radio :value="false" label="Séance Unique"></v-radio>
      </v-radio-group>

      <v-text-field
        v-model="editedSchedule.name"
        label="Nom de l'Horaire"
        :rules="[v => !!v || 'Le nom est requis']"
      ></v-text-field>

      <v-row v-if="!editedSchedule.isRecurring">
        <v-col cols="6">
          <v-text-field
            v-model="editedSchedule.morningStart"
            label="Heure de Début"
            type="time"
            :rules="[
              v => !!v || 'L\'heure de début est requise',
              () => validateTimeOrder('morningStart', 'morningEnd') || 'L\'heure de fin doit être après l\'heure de début' 
            ]"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="editedSchedule.morningEnd"
            label="Heure de Fin"
            type="time"
            :rules="[
              v => !!v || 'L\'heure de fin est requise',
              () => validateTimeOrder('morningStart', 'morningEnd') || 'L\'heure de fin doit être après l\'heure de début' 
            ]"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="6">
          <v-text-field
            v-model="editedSchedule.startDate"
            label="Date Début"
            type="date"
            :rules="[
              v => !!v || 'La date de début est requise',
              () => validateDateOrder('startDate', 'endDate') || 'La date de début doit être avant ou égale à la date de fin'
            ]"
          ></v-text-field>
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="editedSchedule.endDate"
            label="Date Fin"
            type="date"
            :rules="[
              v => !!v || 'La date de fin est requise',
              () => validateDateOrder('startDate', 'endDate') || 'La date de fin doit être après ou égale à la date de début'
            ]"
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions class="justify-end">
      <v-btn color="blue darken-1" text @click="closeDialog">Annuler</v-btn>
      <v-btn
        color="blue darken-1"
        text
        type="submit"
        :disabled="!isFormValid"
      >{{ editedIndex === -1 ? "Créer" : "Modifier" }}</v-btn>
    </v-card-actions>
  </v-form>
      </div>
      </v-card>
    </v-dialog>
    <v-card>
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
              :disabled="item.isSelected||item"
            ></v-checkbox>
          </template>
          <template v-slot:item.schedule="{ item }">
            <div v-if="item.isRecurring&&item.startDate!=null&&item.endDate!=null">
              <span>
                Date début: {{ item.startDate }} à Date fin: {{ item.endDate }}<br>
                Heure Début: {{ item.morningStart }} - Heure Fin: {{ item.afternoonEnd }} - 
                Pause: {{ item.breakStart }} à {{ item.breakEnd }}
              </span>
            </div>
            <div v-if="!item.isRecurring">
              <span>
                Date début: {{ item.startDate }} à Date fin: {{ item.endDate }}<br>
                Heure Début: {{ item.morningStart }} - Heure Fin: {{ item.morningEnd }} - sans Pause
              </span>
            </div>
            <div v-if="item.startDate===null&&item.endDate===null">
              <span>
                Horaire Par Défaut
                Heure Début: {{ item.morningStart }} - Heure Fin: {{ item.morningEnd }} -Pause: {{ item.breakStart }} à {{ item.breakEnd }}
              </span>
            </div>
          </template>
          <template v-slot:item.actions="{ item }">
            <div v-if="!load && !isLoading">
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
          <v-btn color="blue darken-1" text @click="popupVisible = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn color="white" text @click="snackbar.show = false">Fermer</v-btn>
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
      },
      isFormValid: false,
      load: null,
      headers: [
        { title: "Horaire sélectionné", key: "checkbox", sortable: false },
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
      response: null,
      confirmDeleteDialog: false,
      scheduleToDelete: null,
    };
  },
  computed: {
    ...mapGetters('schedule',["getSchedules", "isLoading"]),
  },
  methods: {
    ...mapActions('schedule',[
      "fetchSchedules",
      "createSchedule",
      "updateSchedule",
      "deleteSchedule",
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
      if (this.$refs.form.validate()) {
        if (this.editedIndex > -1) {
          this.response = await this.updateSchedule(this.editedSchedule);
        } else {
          this.response = await this.createSchedule(this.editedSchedule);
        }
        this.showSnackbar(this.response.message, this.response.success ? 'success' : 'error');
        await this.fetchSchedules();
        this.closeDialog();
      }
    },
    closeDialog() {
      this.dialog = false;
      this.$refs.form.reset();
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
      this.scheduleToDelete = item;
      this.confirmDeleteDialog = true;
    },
    async deleteScheduleConfirmed() {
      this.response = await this.deleteSchedule(this.scheduleToDelete.id);
      this.confirmDeleteDialog = false;
      await this.fetchSchedules();
      this.showSnackbar(this.response.message, this.response.success ? 'success' : 'error');
    },
   
    showSnackbar(message, color = 'success') {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    validateTimeOrder(startField, endField) {
      if (!this.editedSchedule[startField] || !this.editedSchedule[endField]) {
        return true; // Skip validation if either field is empty
      }
      return this.editedSchedule[startField] <= this.editedSchedule[endField];
    },
    validateDateOrder(startField, endField) {
      if (!this.editedSchedule[startField] || !this.editedSchedule[endField]) {
        return true; // Skip validation if either field is empty
      }
      return this.editedSchedule[startField] <= this.editedSchedule[endField];
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