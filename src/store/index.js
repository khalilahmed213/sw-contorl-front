import { createStore } from 'vuex';
import auth from './auth';
import agent from './agent';
import schedule from './schedule';
import projects from './projet';
import presence from './presence'
import penalite from './penalite'
import autorisation from './autorisation'
import conge from './conge'
export default createStore({
  modules: {
    auth,
    conge,
    agent,
    schedule,
    projects,
    presence,
    penalite,
    autorisation
  }
});