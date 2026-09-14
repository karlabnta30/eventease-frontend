import axios from 'axios';

const api = axios.create({
    baseURL: 'https://eventease-backend-l06d.onrender.com/api', // Hardcode the live URL for your consultation
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

export default api;