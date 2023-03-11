import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_PORT,
  headers: {
    Accept: 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  },
});

API.interceptors.response.use(
  (res) => {
    return res;
  },
  (err) => {
    return err;
  }
);

export default API;
