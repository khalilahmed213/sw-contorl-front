import { createRouter, createWebHistory } from 'vue-router'
import store from '@/store' 
import Login from '../views/Login.vue'
import Layout from '../views/Layout.vue'
import VueGlobalPresence from '../views/VueGlobalPresence.vue'
import Home from '../views/Home.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
import ForgetPassSucc from '../views/ForgetPassSucc.vue'
import ResetPassSucc from '../views/ResetPassSucc.vue'
import DemandeConge from '../views/DemandeConge.vue'
import Profile from '../views/Profile.vue'
import vuepresenceparticulier from '../views/VuePresenceParticulier.vue'
import gestionutilisateur from '../views/GestionUtilisateur.vue'
import demandeautorisation from '../views/DemandeAutorisation.vue'
import presence from '../views/presence.vue'
import penalite from '../views/penalite.vue'
import absence from '../views/absence.vue'
import retard from '../views/retard.vue'
import retardparticulier from '../views/retardparticulier.vue'
import Homeemployee from '../views/employe/Home.vue'
import demandeautorisationemp from '../views/employe/demadeautorisation.vue'
import demandecongeemp from '../views/employe/demandeconge.vue'
import projet from '../views/Projet.vue'
import ConfigHoraire from '../views/ConfigHoraire.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword
  },
  {
    path: '/reset-password/:token',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/forgot-password-success',
    name: 'ForgotPasswordSuccess',
    component: ForgetPassSucc
  },
  {
    path: '/reset-password-success',
    name: 'ResetPasswordSuccess',
    component: ResetPassSucc
  },
  {
    path: '/app',
    component: Layout,
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'Home',
        name: 'Home Admin',
        component: Home
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
      },
      {
        path: 'conge',
        name: 'Congé',
        component: VueGlobalPresence
      },
      {
        path: 'demandeconge',
        name: 'Demande Congé',
        component: DemandeConge
      },
      {
        path: 'presenceparticulier/:id',
        name: 'synthèse congé particulier',
        component: vuepresenceparticulier
      },
      {
        path: 'gestionutilisateur',
        name: 'Gestion Utilisateur',
        component: gestionutilisateur
      },
      {
        path: 'demandeautorisation',
        name: 'Demande Autorisation',
        component: demandeautorisation
      },
      {
        path: 'presence',
        name: 'Présence',
        component: presence
      },
      {
        path: 'penalite',
        name: 'Penalité',
        component: penalite
      },
      {
        path: 'absence',
        name: 'Absence',
        component: absence
      },
      {
        path: 'retard',
        name: 'Retard',
        component: retard
      },
    
      {
        path: 'projets',
        name: 'Projets',
        component: projet
      },
      {
        path: 'confighoraire',
        name: "configuration d'horaire",
        component: ConfigHoraire
      }
    ]
  },
  {
    path: '/employee',
    component: Layout,
    meta: { requiresAuth: true, role: 'employe' },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: Homeemployee
      },
      {
        path: 'presenceparticulier/:id',
        name: 'Presence particulier employé',
        component: vuepresenceparticulier,
      },
      {
        path: 'demandeautorisation',
        name: 'Demande autorisation employé',
        component: demandeautorisationemp
      },
      {
        path: 'demandeconge',
        name: 'Demande congé employé',
        component: demandecongeemp
      },
      {
        path: 'retardp',
        name: 'Retard Particulier',
        component: retardparticulier
      },
      
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Authentication guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const userRole = store.getters['auth/userRole'];
  const requiredRole = to.meta.role;

  if (requiresAuth) {
    if (!store.getters['auth/isLoggedIn']) {
      next({ name: 'Login' });
    } else if (requiredRole && userRole !== requiredRole) {
      next({ name: 'Login' }); 
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router