import axios from 'axios';
const getAccessToken = () => localStorage.getItem('accessToken');

const state = {
  schedules: [],
  error: null,
  loading: false,
  isselectedschedule:{},
  isRecurring: null,
  schedule:null
}; 

const getters = {
  getSchedules: state => state.schedules,
  getError: state => state.error,
  isLoading: state => state.loading,
  selectedschedule: state=>state.isselectedschedule,
  isrecurring: state => state.isRecurring,
  scheduleSelected: state => state.schedule,
  
};

const mutations = {
  setSchedules(state, schedules) {
    state.schedules = schedules;
  },
  setError(state, error) {
    state.error = error;
  },
  setLoading(state, loading) {
    state.loading = loading; // Added loading mutation
  },
  UPDATE_SCHEDULE(state, updatedSchedule) {
    const index = state.schedules.findIndex(schedule => schedule.id === updatedSchedule.id);
    if (index !== -1) {
      state.schedules.splice(index, 1, updatedSchedule);
    }
  },
  SET_IS_RECURRING(state, isRecurring) {
    state.isrecurring = isRecurring;
  },
  DELETE_SCHEDULE(state, id) {
    state.schedules = state.schedules.filter(schedule => schedule.id !== id);
  },
  SET_SCHEDULE(state,schedule){
    state.schedule=schedule
  },
};

const actions = {
  async fetchSchedules({ commit }) {
    try {
      const response = await axios.get('http://localhost:3000/api/schedules', {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      console.log(response.data)
      commit('setSchedules', response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error.message);
    }
  },
  async createSchedule({ commit }, schedule) {
    commit('setLoading', true); 
    try {
      const response = await axios.post('http://localhost:3000/api/schedules', schedule, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
       // Adjusted to use response.data.data
      return { success:response.data, message: response.data.message }; // Return success message
    } catch (error) {
      return { success: error.response.data.success, message: error.response.data.message };
    } finally {
      commit('setLoading', false); 
    }
  },
  async updateSchedule({ commit }, schedule) {
    commit('setLoading', true);
    try {
      const response = await axios.put(`http://localhost:3000/api/schedules/${schedule.id}`, schedule, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      return { success: true, message: response.data.message }; 
    } catch (error) {
      console.log(error.response.data.message)
      return { success:error.response.data.success, message: error.response.data.message };
    } finally {
      commit('setLoading', false); 
    }
  },
  async deleteSchedule({ commit }, id) {
    commit('setLoading', true); 
    try {
    const response =await axios.delete(`http://localhost:3000/api/schedules/${id}`, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      return { success: response.data.success, message: response.data.message }; 
    } catch (error) {
      return { success:error.response.data.success, message: error.response.data.message };
    } finally {
      commit('setLoading', false); 
    }
  },
  async toggleSelected({ commit }, ScheduleId) {
    try {
      await axios.put(`http://localhost:3000/api/schedules/toggle-selected/${ScheduleId}`,{}, {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });

    } catch (error) {
      commit('setError', error.message);
      console.error('Error toggling isSelected:', error);
      throw error;
    }
  },
  async checkIfScheduleIsRecurring({ commit }, ScheduleId) {
    try {
      const response = await axios.get(`http://localhost:3000/api/schedules/getrecuring`, {
        params: {
          id: ScheduleId,
        },
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      commit('SET_IS_RECURRING', response.data.isRecurring);
    } catch (error) {
      console.log(error)
    }
  },
  async fetchSelectedSchedule({ commit }) {
    try {
      const response = await axios.get('http://localhost:3000/api/schedules/getisselectedschedule', {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      });
      console.log(response.data.schedule.id)
      commit('SET_SCHEDULE', response.data.schedule.id);
    } catch (error) {
      commit('SET_ERROR', error.message);
    } finally {
      commit('SET_LOADING', false);
    }
  },
  

};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};