import axios from "axios";

const API = "https://ai-inventory-management-0y56.onrender.com";

export const getDashboardData = () => {
    return axios.get(`${API}/admin/dashboard`);
};

