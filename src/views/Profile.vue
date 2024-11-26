<template>
  <v-container>
    <!-- User information -->
    <v-card class="mx-auto" max-width="500">
      <v-card-title>
        <span class="headline">{{ agentInfo.name }}</span>
      </v-card-title>
      <v-card-subtitle>{{ agentInfo.email }}</v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <!-- Replace editable fields with read-only text -->
          <v-list-item>
            <v-list-item-title>Months:</v-list-item-title>
            <v-list-item-subtitle>{{ agentInfo.months }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Solde Ancien Conge:</v-list-item-title>
            <v-list-item-subtitle>{{agentInfo.soldeAncienConge }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Address:</v-list-item-title>
            <v-list-item-subtitle>{{ agentInfo.address }}</v-list-item-subtitle>
          </v-list-item>

          <v-list-item>
            <v-list-item-title>Phone:</v-list-item-title>
            <v-list-item-subtitle>{{ agentInfo.phoneNumber }}</v-list-item-subtitle>
          </v-list-item>
          <v-text-field v-model="newPassword" :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'" label="Password" @click:append="togglePassword" />

          <v-btn text color="primary" class="mt-3" @click="togglePasswordReset">
            {{ showPasswordField ? 'Cancel Password Reset' : 'Reset Password' }}
          </v-btn>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn v-if="showPasswordField" color="primary" @click="saveNewPassword" :disabled="!valid">
          Update Password
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions,mapGetters } from 'vuex';
export default {
  data() {
    return {
      valid: true,
      showPasswordField: false,
      newPassword: '',
      password: '',
      showPassword: false,
      passwordRules: [
        v => !!v || 'le mot de passe est requis',
        v => v.length >= 8 || 'le mot de passe doit ètre composé au moin de 8 caractères'
      ],
    };
  },
  
  computed:{
  ...mapGetters('agent',['agentInfo'])
  },
  methods: {
    ...mapActions('auth', ['resetPasswordProfile']),
    togglePasswordReset() {
      this.showPasswordField = !this.showPasswordField;
      if (!this.showPasswordField) {
        this.newPassword = '';
      }
    },
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    async saveNewPassword() {
      try {
       await this.updatePassword(this.newPassword)
        this.showPasswordField = false;
        this.newPassword = '';
      } catch (error) {
      console.error(error)
      }
    },
    async updatePassword(newPassword) {
      await this.resetPasswordProfile({id:this.$store.state.auth.user.id ,password:this.newPassword});
    }
  },
 async mounted(){
  
  },
  async created(){
    await this.$store.dispatch('agent/fetchAgentInfo',this.$store.state.auth.user.id );
  }
};
</script>

<style scoped>
.v-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>