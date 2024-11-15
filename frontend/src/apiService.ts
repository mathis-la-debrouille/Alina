// src/apiService.ts
import axios, { AxiosResponse } from 'axios';

const API_URL = 'http://localhost:3300';

const api = axios.create({
  baseURL: API_URL,
});

// Attach JWT token if available
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface SignupData {
  firstname: string;
  email: string;
  password: string;
  alina_id: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface TokenResponse {
  id: number,
  token: string;
}

interface Ask {
  id: number;
  question: string;
  answer: string;
  audio_response_s3_url: string;
  ask_date: string;
}

interface UserConfig {
  accent?: 'french' | 'spanish' | 'british';
  gender?: 'male' | 'female';
  age?: 'young' | 'old';
}

interface UpdateUserData {
  email?: string;
  password?: string;
  alina_id?: number;
  alina_config?: UserConfig;
}

// Define new User data interface for /user/:userId response
interface UserData {
  id: number;
  firstname: string;
  email: string;
  role: string;
  alina_id: string;
  alina_config: string; // This is a JSON string containing the config
}

interface AskResponse {
  question: string;
  answer: string;
  audio_response_s3_url: string | null;
}

interface AskRequest {
  prompt: string;
  withVocalAnswer?: boolean;
}
// API Functions
export const signup = (data: SignupData): Promise<AxiosResponse<TokenResponse>> => api.post('/signup', data);
export const login = (data: LoginData): Promise<AxiosResponse<TokenResponse>> => api.post('/login', data);
export const getUserAsks = (userId: number): Promise<AxiosResponse<{ asks: Ask[] }>> => api.get(`/user/${userId}/asks`);
export const updateUser = (data: UpdateUserData): Promise<AxiosResponse<{ message: string }>> => api.put('/user/update', data);
export const getUser = (userId: number): Promise<AxiosResponse<UserData>> => api.get(`/user/${userId}`);
export const postAsk = (data: AskRequest): Promise<AxiosResponse<AskResponse>> => api.post('/ask', data);
