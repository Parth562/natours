/* eslint-disable */
import axios from 'axios';
import Stripe from 'stripe';
import { showAlert } from './alerts';
const stripe = Stripe(
    'pk_test_51JdRIKSBodr645W0YQHEUNIoNKEMBaptmqoRuzplWnibOpxUqb4WTJ9WrdxsUk9b0lIJICmD8cGCfjfEgZILzyBF005vw2OcBK'
);

export const bookTour = async (tourId) => {
    try {
        // 1) Get checkout session from API
        const session = await axios(`/api/v1/booking/checkout-session/${tourId}`);
        // console.log(session);
        // Create checkout form and carge credit card
        // await stripe.redirectToCheckout({
        //     sessionId: session.data.session.id,
        // });
        window.location.assign(session.data.session.url);
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};
