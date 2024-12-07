import axios from 'axios';
const getAccessToken = () => localStorage.getItem('accessToken');

const state = {
  todayPresenceAndAbsence: [],
  horaire: null,
  isRecuring: null,
  totalItems: 0,
  currentPage: 1,
  totalPages: 1,
  presencesforacceptance: [],
  loading: false,
  presenceLoading: false,
};

const getters = {
  todayPresenceAndAbsence: state => state.todayPresenceAndAbsence,
  horaire: state => state.horaire,
  isRecuring: state => state.isRecuring,
  totalItems: state => state.totalItems,
  currentPage: state => state.currentPage,
  totalPages: state => state.totalPages,
  presencesforacceptance: state => state.presencesforacceptance,
  presence: state => state.presencesforacceptance.find(p => p.UserId === state.auth.user.id),
};

const actions = {
  async fetchPresenceAndAbsence({ commit }, { dateselect, page, itemsPerPage }) {
    try {
      const response = await axios.get('http://localhost:3000/api/presence/fetch', {
        params: { dateselect, page, itemsPerPage },
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
      await axios.put('http://localhost:3000/api/presence/addtimes', presenceData, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      await dispatch('getPresences');
    } catch (error) {
      console.error('Error updating presence:', error);
      throw error;
    }
  },
  async addPointage({ commit }, { env, date, status, UserId }) {
    try {
      const response = await axios.post('http://localhost:3000/api/presence/addpointage', null, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        },
        params: {
          env, date, status, UserId
        }
      });
      return response.data;
    } catch (error) {
      console.log(error);
    }
  },
  async getPresences({ commit }) {
    try {
      const response = await axios.get('http://localhost:3000/api/presence/getPresences', {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      commit('setPresenceForAcceptance', response.data);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  async togglePresenceStatus({ commit, dispatch }, { id, action, UserId, raison }) {
    try {
      const response = await axios.post('http://localhost:3000/api/presence/toggle-presence', { id, action, UserId, raison }, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      await dispatch('getPresences');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while updating presence status';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING_STATUS', false);
    }
  },
  async fetchPresence({ commit }, presenceId) {
    commit('SET_PRESENCE_LOADING', true);
    try {
      const response = await axios.get(`http://localhost:3000/api/presence/${presenceId}`, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      commit('SET_PRESENCE', response.data);
    } catch (error) {
      console.error('Error fetching presence:', error);
    } finally {
      commit('SET_PRESENCE_LOADING', false);
    }
  },
  async checkButtonStatus({ commit }, { buttonNumber, UserId }) {
    try {
      const response = await axios.get('http://localhost:3000/api/presence/checkButtonStatus', {
        params: {
          buttonNumber,
          UserId
        },
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking button status:', error);
      throw error;
    }
  },
  async confirmTallying({ commit, dispatch }, { presenceId, tallyingPoint, status }) {
    try {
      const response = await axios.post('http://localhost:3000/api/presence/confirmTallying', { presenceId, tallyingPoint, status }, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      await dispatch('getPresences');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while confirming tallying status';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING_STATUS', false);
    }
  },
  async updateOverallStatus({ commit, dispatch }, { presenceId, status }) {
    try {
      const response = await axios.post('http://localhost:3000/api/presence/updateOverallStatus', { presenceId, status }, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      await dispatch('getPresences');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while updating overall status';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING_STATUS', false);
    }
  },
  async togglePresenceStatus({ commit, dispatch }, { id, status, UserId }) {
    try {
      const response = await axios.post('http://localhost:3000/api/presence/toggle-presence-status', { id, status, UserId }, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      await dispatch('getPresences');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while updating presence status';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING_STATUS', false);
    }
  },

  async updatePresenceField({ commit, dispatch }, { id, field, status }) {
    try {
      const response = await axios.post('http://localhost:3000/api/presence/update-presence-field', { id, field, status }, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      await dispatch('getPresences');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred while updating presence field';
      commit('SET_ERROR', errorMessage);
      throw error;
    } finally {
      commit('SET_LOADING_STATUS', false);
    }
  },
};

const mutations = {
  setTodayPresenceAndAbsence(state, data) {
    state.todayPresenceAndAbsence = data;
  },
  setHoraire(state, data) {
    state.horaire = data;
  },
  setIsRecuring(state, data) {
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
  },
  setPresenceForAcceptance(state, presences) {
    state.presencesforacceptance = presences;
  },
  updatePresenceEntry(state, data) {
    const index = state.presencesforacceptance.findIndex(p => p.id === data.id);
    if (index !== -1) {
      state.presencesforacceptance.splice(index, 1, data);
    }
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_LOADING_STATUS(state, status) {
    state.loading = status;
  },
  SET_PRESENCE_LOADING(state, status) {
    state.presenceLoading = status;
  },
  SET_PRESENCE(state, presence) {
    const index = state.presencesforacceptance.findIndex(p => p.id === presence.id);
    if (index !== -1) {
      state.presencesforacceptance.splice(index, 1, presence);
    } else {
      state.presencesforacceptance.push(presence);
    }
  },
};

export default {
  state,
  getters,
  actions,
  mutations,
};