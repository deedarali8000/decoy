import moment from 'moment-timezone';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';
import os from 'os';

const allMenu = async (m, sock) => {
    const prefix = config.PREFIX;
    const mode = config.MODE;
    const pushName = m.pushName || 'User';

    // Uptime Calculation
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (24 * 3600));
    const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    // Time & Greetings
    const realTime = moment().tz("Africa/Dar_es_Salaam").format("HH:mm:ss");
    let pushwish = realTime < "05:00:00" ? "Good Morning 🌄" :
                   realTime < "11:00:00" ? "Good Morning 🌄" :
                   realTime < "15:00:00" ? "Good Afternoon 🌅" :
                   realTime < "19:00:00" ? "Good Evening 🌃" : "Good Night 🌌";

    // Function to Send Button Message
    const sendButtonMessage = async (message, buttons) => {
        const buttonMessage = {
            text: message,
            footer: "Powered by Bera Tech 🚀",
            buttons: buttons,
            headerType: 1
        };

        await sock.sendMessage(m.from, buttonMessage, { quoted: m });
    };

    // Command: menu
    if (m.body.startsWith(`${prefix}menu`)) {
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
            { buttonId: `${prefix}mainmenu`, buttonText: { displayText: "📌 Main Menu" }, type: 1 },
            { buttonId: `${prefix}islamicmenu`, buttonText: { displayText: "☪ Islamic Menu" }, type: 1 },
            { buttonId: `${prefix}downloadmenu`, buttonText: { displayText: "⬇ Download Menu" }, type: 1 },
        ];

        await m.react('✅');
        await sendButtonMessage(menuMessage, buttons);
    }

    // Command: mainmenu
    if (m.body.startsWith(`${prefix}mainmenu`)) {
        await m.react('🦖');
        const mainMenuMessage = `
╭───❍「 *Main Menu* 」
│ 🧑‍💻 *User:* ${pushName} ${pushwish}
│ 🌐 *Mode:* ${mode}
│ ⏰ *Time:* ${realTime}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍`;

        const buttons = [
            { buttonId: `${prefix}ping`, buttonText: { displayText: "🏓 Ping" }, type: 1 },
            { buttonId: `${prefix}alive`, buttonText: { displayText: "✅ Alive" }, type: 1 },
            { buttonId: `${prefix}owner`, buttonText: { displayText: "👤 Owner" }, type: 1 },
        ];

        await m.react('✅');
        await sendButtonMessage(mainMenuMessage, buttons);
    }

    // Command: islamicmenu
    if (m.body.startsWith(`${prefix}islamicmenu`)) {
        await m.react('⏳');
        const islamicMenuMessage = `
╭───❍「 *Islamic Menu* 」
│ 🧑‍💻 *User:* ${pushName} ${pushwish}
│ 🌐 *Mode:* ${mode}
│ ⏰ *Time:* ${realTime}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍`;

        const buttons = [
            { buttonId: `${prefix}surahaudio`, buttonText: { displayText: "📖 Surah Audio" }, type: 1 },
            { buttonId: `${prefix}surahurdu`, buttonText: { displayText: "📜 Surah Urdu" }, type: 1 },
            { buttonId: `${prefix}asmaulhusna`, buttonText: { displayText: "🕌 Asmaul Husna" }, type: 1 },
        ];

        await m.react('✅');
        await sendButtonMessage(islamicMenuMessage, buttons);
    }

    // Command: downloadmenu
    if (m.body.startsWith(`${prefix}downloadmenu`)) {
        await m.react('📥');
        const downloadMenuMessage = `
╭───❍「 *Download Menu* 」
│ 🧑‍💻 *User:* ${pushName} ${pushwish}
│ 🌐 *Mode:* ${mode}
│ ⏰ *Time:* ${realTime}
│ 🚀 *Uptime:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍`;

        const buttons = [
            { buttonId: `${prefix}apk`, buttonText: { displayText: "📦 APK" }, type: 1 },
            { buttonId: `${prefix}facebook`, buttonText: { displayText: "📹 Facebook Video" }, type: 1 },
            { buttonId: `${prefix}ytmp3`, buttonText: { displayText: "🎵 YouTube MP3" }, type: 1 },
        ];

        await m.react('✅');
        await sendButtonMessage(downloadMenuMessage, buttons);
    }
};

export default allMenu;
