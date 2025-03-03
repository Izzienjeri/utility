// src/services/authService.ts

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000'; // Replace with your backend URL

// Login User
export const loginUser = async (email: string, password: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return response.data; // Adjust based on your API response
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};

// Register User
export const registerUser = async (fullName: string, email: string, phone: string, password: string): Promise<any> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      full_name: fullName,
      email,
      phone,
      password,
    });
    return response.data; // Adjust based on your API response
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};