import moment from 'moment-timezone';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';
import os from 'os';

const allMenu = async (m, sock) => {
  const prefix = config.PREFIX;
  const mode = config.MODE;
  const pushName = m.pushName || 'User';

  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  // Calculate uptime
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (24 * 3600));
  const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  // Realtime function
  const realTime = moment().tz("Africa/Dar_es_Salaam").format("HH:mm:ss");

  // Push wish function
  let pushwish = "";
  if (realTime < "05:00:00") {
    pushwish = `𝙶𝙾𝙾𝙳 𝙼𝙾𝚁𝙽𝙸𝙽𝙶 🌄`;
  } else if (realTime < "11:00:00") {
    pushwish = `𝙶𝙾𝙾𝙳 𝙼𝙾𝚁𝙽𝙸𝙽𝙶 🌄`;
  } else if (realTime < "15:00:00") {
    pushwish = `𝙶𝙾𝙾𝙳 𝙰𝙵𝚃𝙴𝚁𝙽𝙾𝙾𝙽 🌅`;
  } else if (realTime < "19:00:00") {
    pushwish = `𝙶𝙾𝙾𝙳 𝙴𝚅𝙴𝙽𝙸𝙽𝙶 🌃`;
  } else {
    pushwish = `𝙶𝙾𝙾𝙳 𝙽𝙸𝙶𝙷𝚃 🌌`;
  }

  const sendButtonMessage = async (messageContent, buttons) => {
    const buttonMessage = {
      text: messageContent,
      footer: "Powered by Bera Tech 🚀",
      buttons: buttons,
      headerType: 1,
    };

    await sock.sendMessage(m.from, buttonMessage, { quoted: m });
  };

  // Command: menu
  if (cmd === "menu") {
    await m.React('⏳');
    const menuMessage = `
╭━━━〔 *Bera Tech Bot* 〕━━━┈⊷
┃★ Developer: *Bruce Bera*
┃★ User: *${m.pushName}*
┃★ Mode: *${mode}*
┃★ Platform: *${os.platform()}*
┃★ Prefix: [${prefix}]
┃★ Version: *1.0.0*
╰━━━━━━━━━━━━━━━┈⊷ 

> *Hey ${m.pushName}, ${pushwish}*
Here are the available commands:
`;

    const buttons = [
      { buttonId: `${prefix}mainmenu`, buttonText: { displayText: "📌 Main Menu" }, type: 1 },
      { buttonId: `${prefix}islamicmenu`, buttonText: { displayText: "☪ Islamic Menu" }, type: 1 },
      { buttonId: `${prefix}downloadmenu`, buttonText: { displayText: "⬇ Download Menu" }, type: 1 },
    ];

    await m.React('✅');
    await sendButtonMessage(menuMessage, buttons);
  }

  // Command: islamicmenu
  if (cmd === "islamicmenu") {
    await m.React('⏳');
    const islamicMenuMessage = `
╭───❍「 *Islamic Menu* 」
│ 🧑‍💻 *User:* ${pushName} ${pushwish}
│ 🌐 *Mode:* ${mode}
│ ⏰ *Time:* ${realTime}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍
`;

    const buttons = [
      { buttonId: `${prefix}surahaudio`, buttonText: { displayText: "📖 Surah Audio" }, type: 1 },
      { buttonId: `${prefix}surahurdu`, buttonText: { displayText: "📜 Surah Urdu" }, type: 1 },
      { buttonId: `${prefix}asmaulhusna`, buttonText: { displayText: "🕌 Asmaul Husna" }, type: 1 },
    ];

    await m.React('✅');
    await sendButtonMessage(islamicMenuMessage, buttons);
  }

  // Command: mainmenu
  if (cmd === "mainmenu") {
    await m.React('🦖');
    const mainMenuMessage = `
╭───❍「 *Main Menu* 」
│ 🧑‍💻 *User:* ${pushName} ${pushwish}
│ 🌐 *Mode:* ${mode}
│ ⏰ *Time:* ${realTime}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍
`;

    const buttons = [
      { buttonId: `${prefix}ping`, buttonText: { displayText: "🏓 Ping" }, type: 1 },
      { buttonId: `${prefix}alive`, buttonText: { displayText: "✅ Alive" }, type: 1 },
      { buttonId: `${prefix}owner`, buttonText: { displayText: "👤 Owner" }, type: 1 },
    ];

    await m.React('✅');
    await sendButtonMessage(mainMenuMessage, buttons);
  }

  // Command: downloadmenu
  if (cmd === "downloadmenu") {
    await m.React('📥');
    const downloadMenuMessage = `
╭───❍「 *Download Menu* 」
│ 🧑‍💻 *User:* ${pushName} ${pushwish}
│ 🌐 *Mode:* ${mode}
│ ⏰ *Time:* ${realTime}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍
`;

    const buttons = [
      { buttonId: `${prefix}apk`, buttonText: { displayText: "📦 APK" }, type: 1 },
      { buttonId: `${prefix}facebook`, buttonText: { displayText: "📹 Facebook Video" }, type: 1 },
      { buttonId: `${prefix}ytmp3`, buttonText: { displayText: "🎵 YouTube MP3" }, type: 1 },
    ];

    await m.React('✅');
    await sendButtonMessage(downloadMenuMessage, buttons);
  }
};

export default allMenu;
