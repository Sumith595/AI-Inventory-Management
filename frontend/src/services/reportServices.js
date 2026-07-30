import axios from "axios";

const API = axios.create({
    baseURL: "https://ai-inventory-management-0y56.onrender.com"
});

export const getReportData = () => {
    return API.get("/admin/report-data");
};