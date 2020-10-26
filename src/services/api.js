import axios from 'axios';

const api = axios.create({
  baseUrl: 'http://localhost:3334',
});

export default api;
