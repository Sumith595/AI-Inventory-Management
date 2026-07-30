import axios from "axios";

const API = "https://ai-inventory-management-0y56.onrender.com";

export const getProducts = () => {
    return axios.get(`${API}/products`);
};

export const getProductById = (id) => {
    return axios.get(`${API}/products/${id}`);
};

export const createProduct = (productData) => {
    return axios.post(`${API}/products`, productData);
};

export const updateProduct = (id, productData) => {
    return axios.put(`${API}/products/${id}`, productData);
};

export const deleteProduct = (id) => {
    return axios.delete(`${API}/products/${id}`);
};

