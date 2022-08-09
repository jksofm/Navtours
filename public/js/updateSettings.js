// const axios = require('axios').default;
import axios from 'axios';
import { showAlert, hideAlert } from './alerts';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updatepassword'
        : '/api/v1/users/updatemydata';

    const res = await axios({
      method: 'PATCH',
      url,
      data: data,
    });
    

    
      if (res.data.status === 'success') {
        showAlert('success', 'Successfully update!');
        window.setTimeout(() => {
          location.assign('/mydata');
        }, 1500);
      }
   
      if (res) {
        showAlert('success', 'Successfully update!');
        window.setTimeout(() => {
          location.assign('/mydata');
        }, 1500);
      }
    
  } catch (e) {
    showAlert('error', e.response.data.message);
  }
};
