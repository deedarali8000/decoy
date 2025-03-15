import moment from 'moment-timezone';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';

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
  const realTime = moment().tz("Africa/Nairobi").format("HH:mm:ss");

  // Push wish function
  let pushwish = "";
  if (realTime < "05:00:00") {
      pushwish = `𝙶𝙾𝙾𝙳 𝙼𝙾𝚁𝙽𝙸𝙽𝙶 🌄`;
  } else if (realTime < "15:00:00") {
      pushwish = `𝙶𝙾𝙾𝙳 𝙰𝙵𝚃𝙴𝚁𝙽𝙾𝙾𝙽 🌅`;
  } else if (realTime < "19:00:00") {
      pushwish = `𝙶𝙾𝙾𝙳 𝙴𝚅𝙴𝙽𝙸𝙽𝙶 🌃`;
  } else {
      pushwish = `𝙶𝙾𝙾𝙳 𝙽𝙸𝙶𝙷𝚃 🌌`;
  }

  const sendCommandMessage = async (messageContent) => {
    await sock.sendMessage(
      m.from,
      {
        text: messageContent,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 999,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315115438245@newsletter', 
            newsletterName: "ʀᴇɢᴀʀᴅs ʙʀᴜᴄᴇ ʙᴇʀᴀ",
            serverMessageId: -1,
          },
          externalAdReply: {
            title: "😇ʀᴇɢᴀʀᴅs ʙʀᴜᴄᴇ ʙᴇʀᴀ😇",
            body: pushName,
            thumbnailUrl: 'https://files.catbox.moe/zeu1ya.jpg',
            sourceUrl: 'https://files.catbox.moe/tdhhl5.mp3',
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
  };

  if (cmd === "menu1") {
    await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

    const aliveMessage = `
╭───❍「 *😇𝗕𝗘𝗥𝗔 𝗧𝗘𝗖𝗛 𝗕𝗢𝗧😇* 」
│ 🧑‍💻 *ᴜsᴇʀ:* ${pushName} ${pushwish}
│ 🌐 *ᴍᴏᴅᴇ:* ${mode}
│ ⏰ *ᴛɪᴍᴇ:* ${realTime}
│ 🚀 *ᴜᴘᴛɪᴍᴇ:* ${days}d ${hours}h ${minutes}m ${seconds}s
╰───────────❍
╭───❍「 *👻𝗕𝗘𝗥𝗔 𝗧𝗘𝗖𝗛  𝗠𝗘𝗡𝗨👻* 」
╭───────────❍
│😇𝗥𝗘𝗚𝗔𝗥𝗗𝗦 𝗕𝗥𝗨𝗖𝗘 𝗕𝗘𝗥𝗔😇
╰───────────❍
`;

    let buttons = [
        { buttonId: ".owner", buttonText: { displayText: "Owner" } }, 
        { buttonId: ".tqto", buttonText: { displayText: "Thanks To" } }
    ];

    let buttonMessage = {
        video: { url: `https://files.catbox.moe/kqxtax.mp4` },
        gifPlayback: true,
        caption: aliveMessage,
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363315115438245@newsletter',
                newsletterName: "𝐂𝐀𝐑𝐑𝐈𝐄 𝐕10"
            }
        },
        footer: "© 𝐉𝐀𝐌𝐄𝐒𝐓𝐄𝐂𝐇 𝐕𝐈𝐏",
        buttons: buttons,
        viewOnce: true,
        headerType: 6
    };

    await sock.sendMessage(m.chat, buttonMessage, { quoted: m });

    await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    await sendCommandMessage(aliveMessage);
  }
};

export default allMenu;
