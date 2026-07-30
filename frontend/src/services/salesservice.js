import axios from "axios";

const API = "http://127.0.0.1:8000";

export const getProducts = () => {
    return axios.get(`${API}/products`);
};

export const saveDailySales = (data) => {
    return axios.post(`${API}/admin/daily-sales`, data);
};

export const getSalesHistory = () => {
    return axios.get(`${API}/admin/daily-sales`);
};