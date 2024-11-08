import axios from 'axios';
const getAccessToken = () => localStorage.getItem('accessToken');
const state = {
  todayPresenceAndAbsence: [],
  horaire:null,
  isRecuring:null,
  totalItems: 0,
  currentPage: 1,
  totalPages: 1,
  presencesforacceptance:null,
  loading:false
};

const getters = {
  todayPresenceAndAbsence: state => state.todayPresenceAndAbsence,
  horaire: state => state.horaire,
  isRecuring: state => state.isRecuring,
  totalItems: state => state.totalItems,
  currentPage: state => state.currentPage,
  totalPages: state => state.totalPages,
  presencesforacceptance:state=>state.presencesforacceptance,
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
  async addPointage({commit},{env,date,status,UserId}){
    try{
      console.log('done')
    const response=await axios.post('http://localhost:3000/api/presence/addpointage',env,{
      headers: {
        Authorization: `Bearer ${getAccessToken()}`
      },
      params:{
        env:env,
        date:date,
        status:status,
        UserId:UserId
      },
      }
    )
    return response.data;
  }catch(error){
    console.log(error)
  }
},
async updatePresence({ commit }, { id, ...fieldsToUpdate }) {
  try {
    // Send both the `id` and the other fields in the request body
    const response = await axios.put('http://localhost:3000/api/presence/addtimes', 
      { id, ...fieldsToUpdate },
      {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
},
async getPresences({ commit }) {
  try {
    // Send both the `id` and the other fields in the request body
    const response = await axios.get('http://localhost:3000/api/getPresences', 
      { id, ...fieldsToUpdate },
      {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`
        }
      }
      
    );
    commit('setPresenceForAccepttance', response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
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
  },
  setPresenceForAccepttance(state,p){
    state.presencesforacceptance=p
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};