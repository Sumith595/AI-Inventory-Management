import axios from "axios";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

export const getPredictions = () => {
    return API.get("/admin/predictions");
};

export const generatePredictions = () => {
    return API.post("/admin/generate-predictions");
};