import axios from 'axios';
const getAccessToken = () => localStorage.getItem('accessToken');
const state = {
  todayPresenceAndAbsence: [],
  horaire:null,
  isRecuring:null,
  totalItems: 0,
  currentPage: 1,
  totalPages: 1,
};

const getters = {
  todayPresenceAndAbsence: state => state.todayPresenceAndAbsence,
  horaire: state => state.horaire,
  isRecuring: state => state.isRecuring,
  totalItems: state => state.totalItems,
  currentPage: state => state.currentPage,
  totalPages: state => state.totalPages,
};

const actions = {
  async fetchPresenceAndAbsence({ commit }, { dateselect, page, itemsPerPage}) {

    try {
      const response = await axios.get('http://localhost:3000/api/presence/fetch', {
        params: { dateselect, page,itemsPerPage},
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
    
      commit('setTodayPresenceAndAbsence', response.data.data);
      commit('setTotalItems', response.data.pagination.totalItems);
    } catch (error) {
      console.error("Error fetching presence and absence:", error);
    }
  },
  async updatePresence({ dispatch }, presenceData) {
    try {
      await axios.post('http://localhost:3000/api/presence', presenceData,{
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }});
      await dispatch('fetchTodayPresenceAndAbsence'); // Refresh the data after updating
    } catch (error) {
      console.error('Error updating presence:', error);
      throw error;
    }
  },
  async addPresence({ commit }, presenceData) {
    try {
      await axios.post('http://localhost:3000/api/presence/add', presenceData, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
    } catch (error) {
      console.error('Error adding presence:', error);
      throw error;
    }
  },
 
}

const mutations = {
  setTodayPresenceAndAbsence(state, data) {
    state.todayPresenceAndAbsence = data;
  },
  sethoraire(state, data) {
    state.horaire = data;
  },
  setisRecuring(state, data) {
    state.isRecuring = data;
  },
  setTotalItems(state, totalItems) {
    state.totalItems = totalItems;
  },
  setCurrentPage(state, currentPage) {
    state.currentPage = currentPage;
  },
  setTotalPages(state, totalPages) {
    state.totalPages = totalPages;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};