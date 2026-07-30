import axios from "axios";

const API = "https://ai-inventory-management-0y56.onrender.com";

export const getProducts = () => {
    return axios.get(`${API}/products`);
};

export const saveDailySales = (data) => {
    return axios.post(`${API}/admin/daily-sales`, data);
};

export const getSalesHistory = () => {
    return axios.get(`${API}/admin/daily-sales`);
};