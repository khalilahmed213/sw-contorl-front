import axios from 'axios';

const getAccessToken = () => localStorage.getItem('accessToken')

export default {
  namespaced: true,
  state: {
    agents: [],
    loading: false,
    error: null,
    total: 0,
    allAgents: [],
    agentInfo:{}
  },
  getters: {
    agents: (state) => state.agents,
    loadingagent: (state) => state.loading,
    error: (state) => state.error,
    total: (state) => state.total,
    allAgents: (state) => state.allAgents, 
    agentInfo: (state) => state. agentInfo, 
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
    SET_AGENT_INFO(state, agentData) {
      state.agentInfo = agentData;
    },
  },
  actions: {
    async fetchAgents({ commit }, { page, limit, sortBy, sortDesc, search}) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);
      
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}api/agents`, {
          params: {
            page,
            limit,
            sortBy,
            sortDesc: sortDesc ? 'true' : 'false',
            search
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
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
        const payload = {
          ...agent,
          UserInfo: {
            months: agent.months,
            soldeAncienConge: agent.soldeAncienConge
          }
        };
        await axios.post(`${process.env.VUE_APP_API_URL}api/agents`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
      } catch (error) {
        console.error('Error creating agent:', error);
        throw error;
      }
    },
    
    async updateAgent({ dispatch }, agent) {
      try {
        const payload = {
          ...agent,
          userInfo: {
            months: agent.months,
            soldeAncienConge: agent.soldeAncienConge
          }
        };
        await axios.put(`${process.env.VUE_APP_API_URL}api/agents/${agent.id}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
      } catch (error) {
        console.error('Error updating agent:', error);
        throw error;
      }
    },
    async deleteAgent({ dispatch }, id) {
      try {
        await axios.delete(`${process.env.VUE_APP_API_URL}api/agents/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
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
        const response = await axios.get(`${process.env.VUE_APP_API_URL}api/agents/allagents`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
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
        await axios.post(`${process.env.VUE_APP_API_URL}api/reset-password`, { email }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
      } catch (error) {
        commit('SET_ERROR', error);
        throw error;
      } finally {
        commit('SET_LOADING', false); 
      }
    },
    async fetchAgentInfo({ commit}, userId) {
      try {
        const response = await axios.get(`${process.env.VUE_APP_API_URL}api/agents/userinfo`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          params: { userId:userId },
        }); 
        const agentData = response.data;
        commit('SET_AGENT_INFO', agentData);
      } catch (error) {
        console.error('Error fetching agent details:', error);

        // Optionally handle the error or return it
        throw new Error(error.response?.data?.message || 'Failed to fetch agent details');
      }
    },
  },
};