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

  // Uptime calculation
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / (24 * 3600));
  const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  const seconds = Math.floor(uptimeSeconds % 60);

  // Real-time function
  const realTime = moment().tz("Africa/Dar_es_Salaam").format("HH:mm:ss");

  // Push wish function
  let pushwish = "";
  if (realTime < "05:00:00") {
    pushwish = `Good Morning 🌄`;
  } else if (realTime < "11:00:00") {
    pushwish = `Good Morning 🌄`;
  } else if (realTime < "15:00:00") {
    pushwish = `Good Afternoon 🌅`;
  } else if (realTime < "19:00:00") {
    pushwish = `Good Evening 🌃`;
  } else {
    pushwish = `Good Night 🌌`;
  }

  const sendButtonMessage = async (title, message, buttons) => {
    const buttonMessage = {
      templateMessage: {
        hydratedTemplate: {
          hydratedContentText: message,
          locationMessage: { jpegThumbnail: null },
          hydratedFooterText: "Powered by Bera Tech 🚀",
          hydratedButtons: buttons,
        },
      },
    };

    const preparedMessage = generateWAMessageFromContent(m.from, proto.Message.fromObject(buttonMessage), {});
    await sock.relayMessage(m.from, preparedMessage.message, { messageId: preparedMessage.key.id });
  };

  // Command: menu
  if (cmd === "menu1") {
    await m.react('⏳');
    const menuMessage = `
╭━━━〔 *Bera Tech Bot* 〕━━━⊷
┃★ Developer: *Bruce Bera*
┃★ User: *${pushName}*
┃★ Mode: *${mode}*
┃★ Platform: *${os.platform()}*
┃★ Prefix: [${prefix}]
┃★ Version: *1.0.0*
╰━━━━━━━━━━━━━━━⊷

Hey *${pushName}*, ${pushwish}
Here are the available menus:`;

    const buttons = [
      { quickReplyButton: { displayText: "📌 Main Menu", id: `${prefix}mainmenu` } },
      { quickReplyButton: { displayText: "☪ Islamic Menu", id: `${prefix}islamicmenu` } },
      { quickReplyButton: { displayText: "⬇ Download Menu", id: `${prefix}downloadmenu` } },
    ];

    await m.react('✅');
    await sendButtonMessage("Main Menu", menuMessage, buttons);
  }

  // Command: islamicmenu
  if (cmd === "islamicmenu") {
    await m.react('⏳');
    const islamicMenuMessage = `
╭───❍「 *Islamic Menu* 」
│ 🧑‍💻 *User:* ${pushName} ${pushwish}
│ 🌐 *Mode:* ${mode}
│ ⏰ *Time:* ${realTime}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍`;

    const buttons = [
      { quickReplyButton: { displayText: "📖 Surah Audio", id: `${prefix}surahaudio` } },
      { quickReplyButton: { displayText: "📜 Surah Urdu", id: `${prefix}surahurdu` } },
      { quickReplyButton: { displayText: "🕌 Asmaul Husna", id: `${prefix}asmaulhusna` } },
    ];

    await m.react('✅');
    await sendButtonMessage("Islamic Menu", islamicMenuMessage, buttons);
  }

  // Command: mainmenu
  if (cmd === "mainmenu") {
    await m.react('🦖');
    const mainMenuMessage = `
╭───❍「 *Main Menu* 」
│ 🧑‍💻 *User:* ${pushName} ${pushwish}
│ 🌐 *Mode:* ${mode}
│ ⏰ *Time:* ${realTime}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍`;

    const buttons = [
      { quickReplyButton: { displayText: "🏓 Ping", id: `${prefix}ping` } },
      { quickReplyButton: { displayText: "✅ Alive", id: `${prefix}alive` } },
      { quickReplyButton: { displayText: "👤 Owner", id: `${prefix}owner` } },
    ];

    await m.react('✅');
    await sendButtonMessage("Main Menu", mainMenuMessage, buttons);
  }

  // Command: downloadmenu
  if (cmd === "downloadmenu") {
    await m.react('📥');
    const downloadMenuMessage = `
╭───❍「 *Download Menu* 」
│ 🧑‍💻 *User:* ${pushName} ${pushwish}
│ 🌐 *Mode:* ${mode}
│ ⏰ *Time:* ${realTime}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍`;

    const buttons = [
      { quickReplyButton: { displayText: "📦 APK", id: `${prefix}apk` } },
      { quickReplyButton: { displayText: "📹 Facebook Video", id: `${prefix}facebook` } },
      { quickReplyButton: { displayText: "🎵 YouTube MP3", id: `${prefix}ytmp3` } },
    ];

    await m.react('✅');
    await sendButtonMessage("Download Menu", downloadMenuMessage, buttons);
  }
};

export default allMenu;
