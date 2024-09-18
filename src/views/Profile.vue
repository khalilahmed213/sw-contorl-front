<template>
    <v-container>
      <v-row>
        <v-col cols="12" md="4" class="d-flex justify-center">
          <!-- User avatar -->
          <v-avatar size="150">
            <img :src="profile.avatar" alt="Profile Picture">
          </v-avatar>
        </v-col>
        <v-col cols="12" md="8">
          <!-- User information -->
          <v-card class="mx-auto" max-width="500">
            <v-card-title>
              <span class="headline">{{ profile.name }}</span>
            </v-card-title>
            <v-card-subtitle>{{ profile.email }}</v-card-subtitle>
            <v-divider></v-divider>
            <v-card-text>
              <v-form>
                <v-textarea v-model="profile.bio" label="Bio" outlined rows="3"></v-textarea>
                <v-text-field v-model="profile.address" label="Address" outlined class="mt-3"></v-text-field>
                <v-text-field v-model="profile.phone" label="Phone" outlined class="mt-3"></v-text-field>
                <!-- Reset Password Link -->
                <v-btn text color="primary" class="mt-3" @click="resetPassword">Reset Password</v-btn>
              </v-form>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="saveProfile">Save</v-btn>
              <v-btn text @click="cancelEdit">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        profile: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg', // Example avatar image
          bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          address: '123 Main Street, Anytown, USA',
          phone: '123-456-7890'
        }
      };
    },
    methods: {
      saveProfile() {
        // Simulate saving profile (can be replaced with actual API call)
        alert('Profile saved!');
      },
      cancelEdit() {
        // Optional: Handle cancel logic
      },
      resetPassword() {
        // Simulate reset password action (can be replaced with actual functionality)
       alert('Password reet link sent to email!');
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