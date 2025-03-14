import moment from 'moment-timezone';
import pkg from '@whiskeysockets/baileys';
const { proto } = pkg;
import config from '../../config.cjs';
import os from 'os';

const donateMenu = async (m, sock) => {
  const prefix = config.PREFIX;
  const mode = config.MODE;
  const pushName = m.pushName || 'User';

  // Only run if the command is triggered by "donatemenu"
  if (!m.body.startsWith(`${prefix}donatemenu`)) return;

  // Uptime calculation
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (24 * 3600));
  const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  // Current time in a specific timezone
  const realTime = moment().tz("Africa/Dar_es_Salaam").format("HH:mm:ss");

  // Greeting based on time
  let pushwish = "";
  if (realTime < "05:00:00") {
    pushwish = "Good Morning 🌄";
  } else if (realTime < "11:00:00") {
    pushwish = "Good Morning 🌄";
  } else if (realTime < "15:00:00") {
    pushwish = "Good Afternoon 🌅";
  } else if (realTime < "19:00:00") {
    pushwish = "Good Evening 🌃";
  } else {
    pushwish = "Good Night 🌌";
  }

  // Construct the donation menu text
  const donateMessage = `
╭───❍「 *Donate Menu* 」
│ 🧑‍💻 *User:* ${pushName} ${pushwish}
│ 🌐 *Mode:* ${mode}
│ ⏰ *Time:* ${realTime}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍

Thank you for considering a donation!
You can support us via:
• **PayPal:** paypal.me/YourLink
• **Bitcoin:** 1A2b3C4d5E6f
• **Other Methods:** Contact Owner for details.
`;

  // Define hydrated quick reply buttons for donation options
  const buttons = [
    { quickReplyButton: { displayText: "💵 PayPal", id: `${prefix}donate_paypal` } },
    { quickReplyButton: { displayText: "₿ Bitcoin", id: `${prefix}donate_bitcoin` } },
    { quickReplyButton: { displayText: "📞 Contact", id: `${prefix}donate_contact` } },
  ];

  // Build the hydrated template message
  const message = {
    templateMessage: {
      hydratedTemplate: {
        hydratedContentText: donateMessage,
        hydratedFooterText: "Powered by Bera Tech 🚀",
        hydratedButtons: buttons,
      },
    },
  };

  // Send the message (quoted for context)
  await sock.sendMessage(m.from, message, { quoted: m });
};

export default donateMenu;
