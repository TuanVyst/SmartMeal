import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  verifyRegisterOtp: (data) => api.post('/auth/verify-register-otp', data),
  googleLogin: (idToken) => api.post('/auth/google-login', { idToken }),
  updateAvatar: (avatarFile) => {
    const formData = new FormData();
    formData.append('avatarFile', avatarFile);

    return api.put('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
