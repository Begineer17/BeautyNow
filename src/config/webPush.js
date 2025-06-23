const webPush = require('web-push');
require('dotenv').config();
// console.log(webPush.generateVAPIDKeys());

const VAPID_KEYS = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY
};

webPush.setVapidDetails(
  `mailto:${process.env.EMAIL_USER}`, // Thay đổi email theo ý muốn
  VAPID_KEYS.publicKey,
  VAPID_KEYS.privateKey
);

module.exports = webPush;