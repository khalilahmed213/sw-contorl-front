<template>
  <div class="d-flex flex-column align-center justify-center min-vh-100 pa-4">
    <VueDatePicker
      v-model="options.dateselect"
      locale="fr"
      cancelText="annuler"
      selectText="selectionner"
      :enable-time-picker="false"
      :max-date="new Date()"
      :format="formatDate"
      @update:model-value="handleDate"
      :clearable="false"
      class="mb-8"
    /> 
  </div>
      
        <v-data-table-server
          :headers="isScheduleRecurring ? headersRecurring : headersRamadan"
          :items="todayPresenceAndAbsence"
          :options.sync="options"
          :server-items-length="totalItems"
           @update:options="fetch"
          :loading="loading"
          class="elevation-1"
        >
          <template v-slot:item.Agent="{ item }">
            {{ item.Agent }}
          </template>
          <template v-slot:item.environnement="{ item }">
            <v-select
              v-model="item.environnement"
              :items="['Onsite', 'Remote', 'Hybrid']"
            ></v-select>
          </template>
          <template v-slot:item.absence="{ item }">
            <v-select
              v-model="item.absence"
              :items="['Présent', 'Absent']"
            ></v-select>
          </template>
          <template v-slot:item.entree="{ item }">
            {{ item.entree }}
          </template>
          <template v-slot:item.sortie="{ item }">
            {{ item.sortie }}
          </template>
          <template v-slot:item.prodMatin="{ item }">
            {{ item.prodMatin }}
          </template>
          <template v-slot:item.entree1="{ item }">
            {{ item.entree1 }}
          </template>
          <template v-slot:item.sortie1="{ item }">
            {{ item.sortie1 }}
          </template>
          <template v-slot:item.prodApresMidi="{ item }">
            {{ item.prodApresMidi }}
          </template>
          <template v-slot:item.prod="{ item }">
            {{ item.prod }}
          </template>
          <template v-slot:item.commentaires="{ item }">
            {{ item.commentaires }}
          </template>
          <template v-slot:item.actions="{ item, index }">
            <v-icon
              v-if="item.absence != 'N/A'"
              @click="openDialog('edit', index)"
              >mdi-pencil</v-icon
            >
            <v-icon v-else @click="openDialog('add', index)"
              >mdi-plus-box</v-icon
            >
          </template>
        </v-data-table-server>
     
      
  
    
    <v-dialog v-model="dialog">
      <v-card>
        <v-card-text>
          <v-text-field
            v-model="editedItem.Agent"
            label="Agent"
            disabled
          ></v-text-field>
          <v-select
            v-model="editedItem.environnement"
            :items="['Onsite', 'Remote', 'Hybrid']"
            label="Environnement"
            v-if="editedItem.absence === 'Présent'"
          ></v-select>
          <v-select
            v-model="editedItem.absence"
            :items="['Présent', 'Absent']"
            label="Absence"
          ></v-select>
          <v-text-field
            v-model="editedItem.entree"
            label="Entrée"
            type="time"
            v-if="editedItem.absence === 'Présent'"
          ></v-text-field>
          <v-text-field
            v-model="editedItem.sortie"
            label="Sortie"
            type="time"
            v-if="editedItem.absence === 'Présent'"
          ></v-text-field>
          <v-text-field
            v-model="editedItem.entree1"
            label="Entrée 1"
            type="time"
            v-if="
              editedItem.absence === 'Présent' && selectedschedule.isRecurring
            "
          ></v-text-field>
          <v-text-field
            v-model="editedItem.sortie1"
            label="Sortie 1"
            type="time"
            v-if="
              editedItem.absence === 'Présent' && selectedschedule.isRecurring
            "
          ></v-text-field>
          <v-textarea
            v-model="editedItem.commentaires"
            label="Commentaires"
            rows="5"
            v-if="
              editedItem.absence === 'Présent' ||
              editedItem.absence === 'Absent'
            "
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeDialog">Cancel</v-btn>
          <v-btn
            :disabled="isSaveDisabled"
            color="blue darken-1"
            text
            @click="saveItem"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
   
  

</template>

<script>
import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import { mapActions, mapGetters } from "vuex";
import moment from "moment";
export default {
  components: {
    VueDatePicker,
  },
  data() {
    return {
      headersRecurring: [
        { title: "Agent", key: "Agent" },
        { title: "Environnement", key: "environnement" },
        { title: "présence", key: "absence" },
        {
          title: "Shift Matin",
          align: "center",
          children: [
            { title: "Entrée Matin", key: "entree" },
            { title: "Sortie Matin", key: "sortie" },
            { title: "Prod Matin", key: "prodMatin" },
          ],
        },
        {
          title: "Shift Après Midi",
          align: "center",
          children: [
            { title: "Entrée Après-Midi", key: "entree1" },
            { title: "Sortie Après-Midi", key: "sortie1" },
            { title: "Prod Après-Midi", key: "prodApresMidi" },
          ],
        },
        { title: "Prod", key: "prod" },
        { title: "Commentaires", key: "commentaires" },
        { title: "Actions", key: "actions", sortable: false },
      ],
      headersRamadan: [
        { title: "Agent", key: "Agent" },
        { title: "Environnement", key: "environnement" },
        { title: "Présence", key: "absence" },
        { title: "Entrée", key: "entree" },
        { title: "Sortie", key: "sortie" },
        { title: "Prod", key: "prod" },
        { title: "Commentaires", key: "commentaires" },
        { title: "Actions", key: "actions", sortable: false },
      ],
      dialog: false,
      editedIndex: -1,
      editedItem: {
        ScheduleId: "",
        UserId: "",
        environnement: "",
        absence: "",
        entree: "",
        sortie: "",
        entree1: "",
        sortie1: "",
        commentaires: "",
        id: "",
        createdAtdate: "",
      },
      mode: "",
      isMenuOpen: false,
      dialoghoraire: false,
      changeschedule: null,
      options: {
        dateselect: new Date(),
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
      },
      loading: false,
    };
  },
  computed: {
    ...mapGetters([
      "selectedschedule",
      "todayPresenceAndAbsence",
      "horaire",
      "getSchedules",
      "isRecuring",
      "totalItems"
    ]),
    isToday() {
      // Compare only the date part
      return moment(this.dateselect).isSame(moment(), "day");
    },
    isSaveDisabled() {
      const {
        absence,
        environnement,
        entree,
        sortie,
        entree1,
        sortie1,
        commentaires,
      } = this.editedItem;
      const { isRecurring } = this.selectedschedule;

      if (absence === "Absent") {
        return !(commentaires && commentaires !== "N/A");
      } else if (isRecurring && absence === "Présent") {
        return !(entree && entree !== "N/A" && sortie && sortie !== "N/A");
      } else {
        return !(
          environnement &&
          environnement !== "N/A" &&
          entree &&
          entree !== "N/A" &&
          sortie &&
          sortie !== "N/A"
        );
      }
    },
    isScheduleRecurring() {
    if (!this.horaire) {
      return this.selectedschedule ? this.selectedschedule.isRecurring : false;
    } else {
      return this.isRecuring;
    }
  },
  },
  methods: {
    ...mapActions([
      "fetchSelectedSchedule",
      "fetchPresenceAndAbsence",
      "updatePresence",
      "addPresence",
    ]),
    ...mapActions(["fetchSchedules", "toggleSelected"]),

    openDialog(mode, index) {
      this.mode = mode;
      if (mode === "edit") {
        this.editedIndex = index;
        this.editedItem = {
          ...this.todayPresenceAndAbsence[index],
          ScheduleId: this.selectedschedule.id,
          createdAtdate: this.options.dateselect,
        };
      } else if (mode === "add") {
        this.editedIndex = index;
        this.editedItem = {
          Agent: this.todayPresenceAndAbsence[index].Agent,
          UserId: this.todayPresenceAndAbsence[index].UserId,
          ScheduleId: this.selectedschedule.id,
          environnement: this.todayPresenceAndAbsence[index].environnement,
          absence: this.todayPresenceAndAbsence[index].absence,
          entree: this.todayPresenceAndAbsence[index].entree,
          sortie: this.todayPresenceAndAbsence[index].sortie,
          entree1: this.todayPresenceAndAbsence[index].entree1,
          sortie1: this.todayPresenceAndAbsence[index].sortie1,
          commentaires: this.todayPresenceAndAbsence[index].commentaires,
          createdAtdate: this.dateselect,
        };
      }
      this.dialog = true;
    },

    async saveItem() {
      if (this.mode == "add") {
        const payload = { ...this.editedItem };

        // Remove entree1 and sortie1 if not recurring
        if (!this.selectedschedule.isRecurring) {
          delete payload.entree1;
          delete payload.sortie1;
        }

        // Format the date before sending it
        payload.createdAtdate = moment(this.dateselect).format("YYYY-MM-DD");

        await this.addPresence(payload);
      } else {
        await this.updatePresence(this.editedItem);
      }
      this.closeDialog();
     this.fetchPresenceAndAbsence(this.options); 
    },
    closeDialog() {
      this.dialog = false;
      this.editedIndex = -1;
    },
  
    formatDate(date) {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    },
    async handleDate() {
      await this.fetch(this.options)  
    },
 
  async fetch(newOptions) {
      if (newOptions) {
        this.options.page = newOptions.page;
        this.options.itemsPerPage=newOptions.itemsPerPage
        this.options.sortBy=newOptions.sortBy
      }
      const {dateselect, page, itemsPerPage, sortBy} = this.options;
      const sortKey = sortBy && sortBy.length > 0 ? sortBy[0].key : "name";
      const sortOrder = sortBy && sortBy.length > 0 ? sortBy[0].order : "asc";
      await this.fetchPresenceAndAbsence({
        dateselect:dateselect,
        page: page,
        itemsPerPage: itemsPerPage,
        sortBy: sortKey,
        sortDesc:sortOrder,
      });
      
    },
  },
  async created() {
    await this.fetchSelectedSchedule();
    await this.fetchSchedules();
    this.options.dateselect = new Date();
  },
  async mounted() {
  },
};
</script>
<style scoped></style>
