import axios from 'axios';
import { showAlert } from './alerts';

export const updateSetting = async (data, type) => {
    try {
        const url =
            type === 'password' ? '/api/v1/users/updateMyPassword' : '/api/v1/users/updateMe';
        const response = await axios({
            method: 'PATCH',
            url,
            data,
        });
        if (response.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated succesfully!`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
