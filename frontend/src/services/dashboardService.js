import axios from "axios";

const API = "http://127.0.0.1:8000";

export const getDashboardData = () => {
    return axios.get(`${API}/admin/dashboard`);
};

