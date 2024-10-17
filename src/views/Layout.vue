<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :rail="mini"
      permanent
      @update:rail="handleRailUpdate"
    >
      <v-list>
        <v-list-item prepend-avatar="/Capture.png" :title="mini ? '' : 'swcontrole'"></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <template v-for="item in menuItems" :key="item.title">
          <v-tooltip
            :disabled="!mini"
            :text="getTooltipText(item)"
            location="right"
          >
            <template v-slot:activator="{ props: tooltipProps }">
              <v-list-group
                v-if="item.subItems"
                :value="item.title"
                :class="{ 'mini-group': mini }"
              >
                <template v-slot:activator="{ props: listGroupProps }">
                  <v-list-item
                    v-bind="{ ...listGroupProps, ...tooltipProps }"
                    :prepend-icon="item.icon"
                    :title="mini ? '' : item.title"
                    @click="handleItemClick(item)"
                  >
                    <template v-slot:append>
                      <v-icon v-if="!mini" :icon="isGroupExpanded(item) ? 'mdi-chevron-up' : 'mdi-chevron-down'"></v-icon>
                    </template>
                  </v-list-item>
                </template>

                <v-list-item
                  v-for="subItem in item.subItems"
                  :key="subItem.title"
                  :to="subItem.to"
                  :prepend-icon="subItem.icon"
                  :title="mini ? '' : subItem.title"
                  :class="{ 'mini-sub-item': mini }"
                  v-bind="tooltipProps"
                ></v-list-item>
              </v-list-group>

              <v-list-item
                v-else
                v-bind="tooltipProps"
                :to="item.to"
                :prepend-icon="item.icon"
                :title="mini ? '' : item.title"
                @click="handleItemClick(item)"
              ></v-list-item>
            </template>
          </v-tooltip>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar>
      <v-app-bar-nav-icon @click="toggleMini"></v-app-bar-nav-icon>
      <v-app-bar-title>{{ currentRouteName }}</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="goToProfile">
        <v-avatar color="primary">
          <v-img src="https://via.placeholder.com/150" alt="Profile"></v-img>
        </v-avatar>
      </v-btn>
      <v-btn @click="Logout" prepend-icon="mdi-logout">Logout</v-btn>
    </v-app-bar>

    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'Layout',
  data() {
    return {
      drawer: true,
      mini: false,
      expandedGroup: null,
      selectedItem: null,
    };
  },
  computed: {
    ...mapGetters('auth', ['userRole']),
    currentRouteName() {
      return this.$route.name;
    },
    menuItems() {
      return this.userRole === 'admin'
        ? [
            { title: 'Home', icon: 'mdi-home', to: '/app/home' },
            { 
              title: 'Gestion Congé', 
              icon: 'mdi-calendar',
              subItems: [
                { title: 'Congé', icon: 'mdi-calendar-check', to: '/app/conge' },
                { title: 'Demandes Congés', icon: 'mdi-calendar-clock', to: '/app/demandeconge' },
              ]
            },
            { title: 'Gestion utilisateur', icon: 'mdi-account-group', to: '/app/gestionutilisateur' },
            { title: 'Demandes Autorisation', icon: 'mdi-clipboard-check', to: '/app/demandeautorisation' },
            { title: 'Presence', icon: 'mdi-account-check', to: '/app/presence' },
            { title: 'Penalite', icon: 'mdi-gavel', to: '/app/penalite' },
            { title: 'Absence', icon: 'mdi-account-off', to: '/app/absence' },
            { title: 'Retard', icon: 'mdi-clock-alert', to: '/app/retard' },
            { title: 'Horaires', icon: 'mdi-clock', to: '/app/confighoraire' },
            { title: 'Projets', icon: 'mdi-briefcase', to: '/app/projets' },
          ]
        : [
            { title: 'Congé', icon: 'mdi-calendar-account', to: '/employee/presenceparticulier' },
            { title: 'Retard', icon: 'mdi-clock-alert', to: '/employee/retardp' },
            { title: 'Demande autorisation', icon: 'mdi-clipboard-check', to: '/employee/demandeautorisation' },
            { title: 'Demande congé', icon: 'mdi-calendar-clock', to: '/employee/demandeconge' },
          ];
    },
  },
  methods: {
    ...mapActions('auth', ['logout']),
    Logout() {
      this.logout();
      this.$router.push({ name: 'Login' });
    },
    goToProfile() {
      this.$router.push({ name: 'Profile' });
    },
    toggleMini() {
      this.mini = !this.mini;
      if (this.mini) {
        this.expandedGroup = null;
      }
    },
    handleRailUpdate(value) {
      if (!value) {
        this.mini = false;
      }
    },
    handleItemClick(item) {
      if (this.mini) {
        this.toggleMini();
      } else if (item.subItems) {
        this.expandedGroup = this.expandedGroup === item.title ? null : item.title;
      }
      this.selectedItem = item;
    },
    isGroupExpanded(item) {
      return this.expandedGroup === item.title;
    },
    getTooltipText(item) {
      if (item.subItems) {
        const activeSubItem = item.subItems.find(subItem => this.$route.path === subItem.to);
        return activeSubItem ? `${item.title} - ${activeSubItem.title}` : item.title;
      }
      return item.title;
    },
  },
  watch: {
    '$route'() {
      if (this.mini) {
        this.expandedGroup = null;
      }
      this.selectedItem = this.menuItems.find(item => 
        item.to === this.$route.path || (item.subItems && item.subItems.some(subItem => subItem.to === this.$route.path))
      );
    },
  },
};
</script>

<style scoped>
.v-list-group__items .v-list-item {
  padding-left: 16px !important;
}

.v-navigation-drawer--rail .v-list-item__prepend {
  justify-content: center;
}

.v-navigation-drawer--rail .v-list-group__items .v-list-item {
  padding-left: 0 !important;
}

.v-navigation-drawer--rail .v-list-item__content,
.v-navigation-drawer--rail .v-list-group__items .v-list-item__content {
  opacity: 0;
  width: 0;
  transition: opacity 0.2s ease-out, width 0.2s ease-out;
}

.v-navigation-drawer--rail .v-list-group__items .v-list-item__prepend {
  min-width: 0;
  margin-inline-end: 0;
}

.v-navigation-drawer--rail .v-list-group__items .v-list-item {
  justify-content: center;
}

.mini-group {
  position: relative;
}

.v-navigation-drawer--rail .mini-group .v-list-group__items {
  display: none;
}

.mini-sub-item .v-list-item__content {
  display: block !important;
  opacity: 1 !important;
  width: auto !important;
}
</style>