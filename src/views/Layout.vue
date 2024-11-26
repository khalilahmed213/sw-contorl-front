<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" :rail="mini" permanent @update:rail="handleRailUpdate">
      <v-list>
        <v-list-item prepend-avatar="/Capture.PNG" :title="mini ? '' : 'swcontrole'"></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <template v-for="item in menuItems" :key="item.title">
          <v-list-group v-if="item.subItems" :value="item.title" :active="isGroupActive(item)"
            :class="{ 'mini-group': mini }">
            <template v-slot:activator="{ props }">
              <v-tooltip :text="mini ? item.title : ''" location="right" :disabled="!mini">
                <template v-slot:activator="{ props: tooltipProps }">
                  <v-list-item v-bind="{ ...props, ...tooltipProps }" :prepend-icon="item.icon"
                    :title="mini ? '' : item.title" @click="handleItemClick(item)">
                    <template v-slot:append>
                      <v-icon v-if="!mini">
                        {{ isGroupExpanded(item) ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                      </v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-tooltip>
            </template>

            <v-tooltip v-for="subItem in item.subItems" :key="subItem.title" :text="mini ? subItem.title : ''"
              location="right" :disabled="!mini">
              <template v-slot:activator="{ props: tooltipProps }">
                <v-list-item :to="subItem.to" :prepend-icon="subItem.icon" :title="mini ? '' : subItem.title"
                  :class="{ 'mini-sub-item': mini, 'sub-item': !mini }" v-bind="tooltipProps"
                  @click="handleSubItemClick(item, subItem)"></v-list-item>
              </template>
            </v-tooltip>
          </v-list-group>

          <v-tooltip v-else :text="mini ? item.title : ''" location="right" :disabled="!mini">
            <template v-slot:activator="{ props: tooltipProps }">
              <v-list-item :to="item.to" :prepend-icon="item.icon" :title="mini ? '' : item.title" v-bind="tooltipProps"
                @click="handleItemClick(item)"></v-list-item>
            </template>
          </v-tooltip>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar height="72">
      <v-app-bar-nav-icon @click="toggleMini" size="large"></v-app-bar-nav-icon>
      <v-app-bar-title class="text-h5">{{ currentRouteName }}</v-app-bar-title>
      <v-spacer></v-spacer>
    <div v-if="userRole !=='admin'" >
      <v-btn icon @click="goToProfile" size="large">
        <v-avatar color="primary" size="48">
          <v-img src="https://via.placeholder.com/150" alt="Profile"></v-img>
        </v-avatar>
      </v-btn>
    </div>
      <v-btn @click="logout" prepend-icon="mdi-logout" size="large">Logout</v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapGetters,mapActions } from 'vuex';
export default {
  name: 'Layout',
  data() {
    return {
      drawer: true,
      mini: false,
      expandedGroup: null,
      selectedItem: null
    };
  },
  computed: {
    currentRouteName() {
      return this.$route.name;
    },
    ...mapGetters('auth', ['userRole']),
    menuItems() {
      return this.userRole == 'admin'
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
          {
            title: 'Confirmation de Présence',
            icon: 'mdi-check-circle',
            to: '/app/confirmationpresence'
          },
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
          { title: 'Pointage', icon: 'mdi-timetable', to: '/employee/pointage' },

        ];
    },
  },
  methods: {
   
    async logout() {
    await this.$store.dispatch('auth/logout');
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
    async handleItemClick(item) {
      if (item.subItems) {
        if (this.mini) {
          // If sidebar is collapsed and item has subitems, expand sidebar first
          this.mini = false;
          // Wait for the sidebar animation to complete
          await this.$nextTick();
          setTimeout(() => {
            this.expandedGroup = this.expandedGroup === item.title ? null : item.title;
          }, 300);
        } else {
          // If sidebar is already expanded, just toggle the submenu
          this.expandedGroup = this.expandedGroup === item.title ? null : item.title;
        }
      } else {
        // For items without subitems, just navigate
        this.$router.push(item.to);
        this.selectedItem = item;
      }
    },
    handleSubItemClick(parentItem, subItem) {
      this.$router.push(subItem.to);
      this.selectedItem = subItem;
      // Close the submenu if the sidebar is collapsed
      if (this.mini) {
        this.expandedGroup = null;
      }
    },
    isGroupExpanded(item) {
      return this.expandedGroup === item.title;
    },
    isGroupActive(item) {
      if (item.subItems) {
        return item.subItems.some(subItem => this.$route.path.startsWith(subItem.to));
      }
      return this.$route.path.startsWith(item.to);
    },
  },
  watch: {
    '$route'() {
      // Close expanded group when route changes and sidebar is collapsed
      if (this.mini) {
        this.expandedGroup = null;
      }
      this.selectedItem = this.menuItems.find(item =>
        this.$route.path.startsWith(item.to) ||
        (item.subItems && item.subItems.some(subItem => this.$route.path.startsWith(subItem.to)))
      );
      if (this.selectedItem?.subItems && !this.mini) {
        this.expandedGroup = this.selectedItem.title;
      }
    },
  },
};
</script>

<style>
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
  display: flex;
  flex-direction: column;
  align-items: center;
}

.mini-sub-item .v-list-item__content {
  display: flex !important;
}

.sub-item {
  padding-left: 56px !important;
}

.v-navigation-drawer--rail .mini-sub-item {
  padding-left: 0 !important;
}

.v-main {
  font-size: 16px;
  line-height: 1.6;
}

.v-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.v-navigation-drawer--rail .v-list-group__items .v-list-item {
  justify-content: left;
  margin-left: 15px;

}
</style>