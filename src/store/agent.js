import axios from 'axios';

const getAccessToken = () => localStorage.getItem('accessToken');

export default {
  namespaced: true,
  state: {
    agents: [],
    loading: false,
    error: null,
    total: 0,
    allAgents: [], // New state for all agents
  },
  getters: {
    agents: (state) => state.agents,
    loadingagent: (state) => state.loading,
    error: (state) => state.error,
    total: (state) => state.total,
    allAgents: (state) => state.allAgents, // New getter for all agents
  },
  mutations: {
    SET_AGENTS(state, agents) {
      state.agents = agents;
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_TOTAL(state, total) {
      state.total = total;
    },
    SET_ALL_AGENTS(state, allAgents) {
      state.allAgents = allAgents;
    },
  },
  actions: {
    async fetchAgents({ commit }, { page, limit, sortBy, sortDesc, search}) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await axios.get(`http://localhost:3000/api/agents`, {
          params: {
            page,
            limit,
            sortBy,
            sortDesc: sortDesc ? 'true' : 'false',
            search
          },
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        });
    
        commit('SET_AGENTS', response.data.agents);
        commit('SET_TOTAL', response.data.total);
      } catch (error) {
        commit('SET_ERROR', error);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async createAgent({ dispatch }, agent) {
      try {
        await axios.post('http://localhost:3000/api/agents', agent, {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        });
        dispatch('fetchAgents', { page: 1 });
      } catch (error) {
        console.error('Error creating agent:', error);
        throw error;
      }
    },
    async updateAgent({ dispatch }, agent) {
      try {
        await axios.put(`http://localhost:3000/api/agents/${agent.id}`, agent, {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        });
        dispatch('fetchAgents', { page: 1 });
      } catch (error) {
        console.error('Error updating agent:', error);
        throw error;
      }
    },
    async deleteAgent({ dispatch }, id) {
      try {
        await axios.delete(`http://localhost:3000/api/agents/${id}`, {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        });
        dispatch('fetchAgents', { page: 1 });
      } catch (error) {
        console.error('Error deleting agent:', error);
        throw error;
      }
    },
    async fetchAllAgents({ commit }) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await axios.get(`http://localhost:3000/api/agents/allagents`, {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        });
        commit('SET_ALL_AGENTS', response.data);
      } catch (error) {
        commit('SET_ERROR', error);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    async resetPassword({ commit }, email) {
      commit('SET_LOADING', true); // Set loading to true at the start
      try {
        await axios.post('http://localhost:3000/api/reset-password', { email }, {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        });
        // Optionally handle success here
      } catch (error) {
        commit('SET_ERROR', error);
        throw error;
      } finally {
        commit('SET_LOADING', false); // Set loading to false at the end
      }
    },
  },
};