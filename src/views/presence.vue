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
          :headers="!isScheduleRecurring ? headersRecurring : headersRamadan"
          :items="todayPresenceAndAbsence"
          :options.sync="options"
          :server-items-length="totalItems"
           @update:options="fetch"
          :loading="loading"
          :items-length="totalItems"
          class="elevation-1"
        >
          <template v-slot:item.Agent="{ item }">
            {{ item.Agent }}
          </template>
          <template v-slot:item.environnement="{ item }">
            {{ item.environnement }}
          </template>
          <template v-slot:item.absence="{ item }">
            {{ item.absence}}
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
              editedItem.absence === 'Présent' && !isScheduleRecurring
            "
          ></v-text-field>
          <v-text-field
            v-model="editedItem.sortie1"
            label="Sortie 1"
            type="time"
            v-if="
              editedItem.absence === 'Présent' && !isScheduleRecurring
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
  <div>{{ totalItems }}</div>

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
        { title: "Agent", key: "Agent",sortable:false },
        { title: "Environnement", key: "environnement" ,sortable:false},
        { title: "présence", key: "absence",sortable:false},
        {
          title: "Shift Matin",
          align: "center",
          children: [
            { title: "Entrée Matin", key: "entree",sortable:false },
            { title: "Sortie Matin", key: "sortie" ,sortable:false},
            { title: "Prod Matin", key: "prodMatin" ,sortable:false},
          ],
        },
        {
          title: "Shift Après Midi",
          align: "center",
          children: [
            { title: "Entrée Après-Midi", key: "entree1" ,sortable:false},
            { title: "Sortie Après-Midi", key: "sortie1",sortable:false },
            { title: "Prod Après-Midi", key: "prodApresMidi" ,sortable:false},
          ],
        },
        { title: "Prod", key: "prod" ,sortable:false},
        { title: "Commentaires", key: "commentaires",sortable:false },
        { title: "Actions", key: "actions", sortable: false },
      ],
      headersRamadan: [
        { title: "Agent", key: "Agent",sortable:false },
        { title: "Environnement", key: "environnement",sortable:false },
        { title: "Présence", key: "absence" ,sortable:false},
        { title: "Entrée", key: "entree" ,sortable:false},
        { title: "Sortie", key: "sortie" ,sortable:false},
        { title: "Prod", key: "prod" },
        { title: "Commentaires", key: "commentaires" ,sortable:false},
        { title: "Actions", key: "actions", sortable: false,sortable:false },
      ],
      dialog: false,
      editedIndex: -1,
      editedItem: {
  recordType: '',
  recordId: '',
  UserId: '',
  Agent: '',
  environnement: '',
  absence: '',
  entree: '',
  sortie: '',
  entree1: '',
  sortie1: '',
  prod: 'N/A',
  prodMatin: 'N/A',
  prodApresMidi: 'N/A',
  commentaires: '',
  createdAtdate: ''
},
      mode: "",
      isMenuOpen: false,
      dialoghoraire: false,
      changeschedule: null,
      options: {
        dateselect: new Date(),
        page: 1,
        itemsPerPage: 10,
      },
      loading: false,
    };
  },
  computed: {
    ...mapGetters([
      "todayPresenceAndAbsence",
      "horaire",
      "getSchedules",
      "totalItems",
    ]),
    ...mapGetters('schedule',["isRecurring"]),
    
 
    isScheduleRecurring() {
      return this.isRecurring;
  },
  },
  methods: {
    ...mapActions('schedule',['checkIfScheduleIsRecurring']),
    ...mapActions([
      "fetchPresenceAndAbsence",
    ]),
    ...mapActions(["fetchSchedules", "toggleSelected"]),

    
  
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
      }
      const {dateselect, page, itemsPerPage} = this.options;
  
      await this.fetchPresenceAndAbsence({
        dateselect:dateselect,
        page: page,
        itemsPerPage: itemsPerPage,
      });
      await this.checkIfScheduleIsRecurring(this.options.dateselect);
    },
  },
  mounted(){

  },
  async created() {
   
    this.options.dateselect = new Date();
    await this.checkIfScheduleIsRecurring(this.options.dateselect);
  },
};
</script>
<style scoped></style>
