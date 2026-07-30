import axios from "axios";

const API = axios.create({
    baseURL: "https://ai-inventory-management-0y56.onrender.com"
});

export const getPredictions = () => {
    return API.get("/admin/predictions");
};

export const generatePredictions = () => {
    return API.post("/admin/generate-predictions");
};