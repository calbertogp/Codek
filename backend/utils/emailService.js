const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to create access token :(");
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_USER,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN
    }
  });

  return transporter;
};

const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Booking Confirmation',
    text: `Your booking for ${bookingDetails.houseName} from ${bookingDetails.startDate} to ${bookingDetails.endDate} has been confirmed.`
  };

  try {
    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(mailOptions);
    console.log('Confirmation email sent');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
  }
};

module.exports = { sendBookingConfirmation };