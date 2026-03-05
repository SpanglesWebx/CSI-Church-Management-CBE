const axios = require("axios");

exports.sendSMS = async (mobile, otp) => {
  return axios.post(
    "https://sms-verify3.p.rapidapi.com/send-numeric-verify",
    { target: mobile, code: otp, estimate: true },   // 👈 REAL SMS
    {
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": process.env.RAPID_SMS_HOST,
        "x-rapidapi-key": process.env.RAPID_SMS_KEY
      }
    }
  );
};


