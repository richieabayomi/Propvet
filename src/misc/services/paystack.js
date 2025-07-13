const axios = require('axios');

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

async function initiatePayment({ email, amount, reference, callback_url }) {
  const response = await axios.post(
    `${PAYSTACK_BASE_URL}/transaction/initialize`,
    {
      email,
      amount: amount * 100, 
      reference,
      callback_url
    },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

async function verifyPayment(reference) {
  const response = await axios.get(
    `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
}

module.exports = { initiatePayment, verifyPayment };
