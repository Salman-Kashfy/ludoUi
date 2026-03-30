import axios, {AxiosRequestConfig, InternalAxiosRequestConfig} from "axios";
import {constants} from '../utils/constants'
import {GetToken} from "./auth/auth.service";

// Use API proxy base path from constants so frontend routes 
// /api/* to backend (Vite proxy) when running locally.

export const axiosService = axios;

export const api = axios.create({
    baseURL: constants.API_URL,
    timeout: 60 * 1000
} as AxiosRequestConfig);

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.data) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject(error);
    }
);

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        let token = GetToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }
        return config;
    },
    (exc) => Promise.reject(exc)
);
