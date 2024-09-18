import { createStore } from 'vuex';
import auth from './auth';
import agent from './agent';
import schedule from './schedule';
import projects from './projet';
import presence from './presence'
import penalite from './penalite'
import autorisation from './autorisation'
export default createStore({
  modules: {
    auth,
    agent,
    schedule,
    projects,
    presence,
    penalite,
    autorisation
  }
});