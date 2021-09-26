import axios from 'axios';
import { showAlert } from './alerts.js';

export const login = async (email, password) => {
    try {
        const response = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:3000/api/v1/users/login',
            data: {
                email,
                password,
            },
        });
        if (response.data.status === 'success') {
            showAlert('success', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        ShowAlert('error', error.response.data.message);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:3000/api/v1/users/logout',
        });
        if (res.data.status === 'success') {
            location.assign('/');
        }
    } catch (err) {
        showAlert('error', 'Error loggin out!!');
    }
};
