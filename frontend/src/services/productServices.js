import axios from "axios";

const API = "http://127.0.0.1:8000";

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

