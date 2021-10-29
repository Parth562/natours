import '@babel/polyfill';
import { login, logout, signUp } from './login.js';
import { updateSetting } from './updateSetting.js';
import { bookTour } from './stripe.js';

const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateUserForm = document.querySelector('.form-user-data');
const passwordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        login(email, password);
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;
        signUp(name, email, password, passwordConfirm);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        logout();
    });
}

if (updateUserForm) {
    updateUserForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);

        updateSetting(form, 'data');
    });
}

if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Saving password...';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        await updateSetting({ password, passwordConfirm, passwordCurrent }, 'password');

        document.querySelector('.btn--save-password').textContent = 'SAVE PASSWORD';

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (bookBtn) {
    bookBtn.addEventListener('click', async (e) => {
        const { tourId } = e.target.dataset;
        e.target.textContent = 'Processing...';
        await bookTour(tourId);
        e.target.textContent = 'Book Tour Now!';
    });
}
