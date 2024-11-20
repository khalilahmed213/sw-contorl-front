<template>
    <v-container>
          <!-- User information -->
          <v-card class="mx-auto" max-width="500">
            <v-card-title>
              <span class="headline">{{ profile.name }}</span>
            </v-card-title>
            <v-card-subtitle>{{ profile.email }}</v-card-subtitle>
            <v-divider></v-divider>
            <v-card-text>
              <v-form ref="form" v-model="valid">
                <!-- Replace editable fields with read-only text -->
                <v-list-item>
                  <v-list-item-title>Months:</v-list-item-title>
                  <v-list-item-subtitle>{{ profile.months }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <v-list-item-title>Solde Ancien Conge:</v-list-item-title>
                  <v-list-item-subtitle>{{ profile.soldeAncienConge }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <v-list-item-title>Address:</v-list-item-title>
                  <v-list-item-subtitle>{{ profile.address }}</v-list-item-subtitle>
                </v-list-item>
                
                <v-list-item>
                  <v-list-item-title>Phone:</v-list-item-title>
                  <v-list-item-subtitle>{{ profile.phone }}</v-list-item-subtitle>
                </v-list-item>

                <!-- Password reset section -->
                <v-text-field
                  v-if="showPasswordField"
                  v-model="newPassword"
                  label="New Password"
                  type="password"
                  :rules="passwordRules"
                  outlined
                  class="mt-3"
                ></v-text-field>
                
                <v-btn 
                  text 
                  color="primary" 
                  class="mt-3" 
                  @click="togglePasswordReset"
                >
                  {{ showPasswordField ? 'Cancel Password Reset' : 'Reset Password' }}
                </v-btn>
              </v-form>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn 
                v-if="showPasswordField" 
                color="primary" 
                @click="saveNewPassword"
                :disabled="!valid"
              >
                Update Password
              </v-btn>
            </v-card-actions>
          </v-card>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        valid: true,
        showPasswordField: false,
        newPassword: '',
        passwordRules: [
          v => !!v || 'le mot de passe est requis',
          v => v.length >= 8 || 'le mot de passe doit ètre composé au moin de 8 caractères'
        ],
        profile: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          months: 24,
          soldeAncienConge: 10,
          address: '123 Main Street, Anytown, USA',
          phone: '123-456-7890'
        }
      };
    },
    methods: {
      togglePasswordReset() {
        this.showPasswordField = !this.showPasswordField;
        if (!this.showPasswordField) {
          this.newPassword = '';
        }
      },
      async saveNewPassword() {
        try {
          // Add your API call here to update the password
          await this.updatePassword(this.newPassword);
          this.$emit('password-updated');
          this.showPasswordField = false;
          this.newPassword = '';
          // Show success message
          this.$emit('show-message', {
            text: 'Password updated successfully',
            color: 'success'
          });
        } catch (error) {
          // Handle error
          this.$emit('show-message', {
            text: 'Failed to update password',
            color: 'error'
          });
        }
      },
      async updatePassword(newPassword) {
        // Implement your API call here
        console.log('Updating password:', newPassword);
      }
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