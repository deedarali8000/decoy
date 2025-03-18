import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';

const alive = async (m, sock) => {
  // Use the mode from your config, if needed for the menu display.
  const mode = config.MODE;
  const pushName = m.pushName || 'User';

  // Check if the message is exactly "menu" (case-insensitive)
  if (m.body.trim().toLowerCase() === "menu") {
    await m.React('⏳'); // React with a loading icon

    // Calculate uptime
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (24 * 3600));
    const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);

    // Get real time
    const realTime = moment().tz("Asia/Karachi").format("HH:mm:ss");
    const time2 = moment().tz("Asia/Karachi").format("HH:mm:ss");

    let pushwish = "";
    if (time2 < "05:00:00") {
      pushwish = `Good Morning 🌄`;
    } else if (time2 < "11:00:00") {
      pushwish = `Good Morning 🌄`;
    } else if (time2 < "15:00:00") {
      pushwish = `Good Afternoon 🌅`;
    } else if (time2 < "18:00:00") {
      pushwish = `Good Evening 🌃`;
    } else if (time2 < "19:00:00") {
      pushwish = `Good Evening 🌃`;
    } else {
      pushwish = `Good Night 🌌`;
    }

    // Construct the menu message (you can adjust the menu content as needed)
    const aliveMessage = `╭┈───────────────•*
*⇆ HELLO ⇆* *${pushName}*
             _${pushwish}_
*⇆ ✨ ʙᴇʀᴀ ᴛᴇᴄʜ ᴄᴏᴍᴍᴀɴᴅ ʟɪsᴛ  ✨ ⇆*
*╰┈───────────────•*
*╭┈───────────────•* 
*│  ◦* 𝙱𝙾𝚃 𝙽𝙰𝙼𝙴: ʙᴇʀᴀ ᴛᴇᴄʜ ʙᴏᴛ
*│  ◦* 𝚅𝙴𝚁𝚂𝙸𝙾𝙽: 1.0
*│  ◦* 𝙳𝙴𝚅: ʙʀᴜᴄᴇ ʙᴇʀᴀ
*│  ◦* 𝙼𝙾𝙳𝙴: *${mode}*
*│  ◦* 𝚄𝙿𝚃𝙸𝙼𝙴: *${days}d ${hours}h ${minutes}m ${seconds}s*
*│  ◦* 𝙲𝚄𝚁𝚁𝙴𝙽𝚃 𝚃𝙸𝙼𝙴: *${realTime}*
*╰┈───────────────•*
*♡︎•━━━━━━☻︎━━━━━━•♡︎*
*[ • *👻𝗕𝗘𝗥𝗔 𝗧𝗘𝗖𝗛 𝗕𝗢𝗧👻* • ]*
*╭┈───────────────•*
*┋*🫡𝗥𝗘𝗚𝗔𝗥𝗗𝗦 𝗕𝗥𝗨𝗖𝗘 𝗕𝗘𝗥𝗔🫡*
*╰┈───────────────•*
*[ •  𝙾𝚆𝙽𝙴𝚁 𝙲𝙼𝙳  ‎• ]*
*╭┈───────────────•*
*┋*BLOCK
*┋*UNBLOCK
*┋*JOIN
*┋*LEAVE
*┋*SETVAR
*┋*RESTART
*┋*PP
*┋*Restart
*┋*OwnerReact
*┋*HeartReact
*┋*Join
*┋*Left 
*┋*Broadcast 
*┋*Vv  
*┋*Vv2
*┋*Del
*┋*Save
*╰┈───────────────•*
*[ •  SEARCH CMD  ‎• ]*
*╭┈───────────────•*
*┋*YTS
*┋*GOOGLE
*┋*IMD
*┋*IMG
*┋*WEATHER
*┋*PLAYSTORE
*┋*NEWS
*╰┈───────────────•*
*[ •  AI CMD   ‎• ]*
*╭┈───────────────•*
*┋*BLACKBOXAI
*┋*GPT
*┋*VISIT
*┋*DEFINE
*╰┈───────────────•*
...
🌐 𝗠𝗢𝗥𝗘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 𝗖𝗢𝗠𝗜𝗡𝗚 𝗦𝗢𝗢𝗡! 🌐`;

    await m.React('✅'); // React with a success icon

    // Send the constructed menu message back to the chat
    sock.sendMessage(
      m.from,
      {
        text: aliveMessage,
        contextInfo: {
          isForwarded: false,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363315115438245@newsletter',
            newsletterName: "𝗕𝗘𝗥𝗔 𝗧𝗘𝗖𝗛 𝗕𝗢𝗧",
            serverMessageId: -1,
          },
          forwardingScore: 999,
          externalAdReply: {
            title: "✨ 𝗕𝗘𝗥𝗔 𝗧𝗘𝗖𝗛 𝗕𝗢𝗧 ✨",
            body: "BERA TECH BOT MENU",
            thumbnailUrl: 'https://files.catbox.moe/ld9uw5.jpg',
            sourceUrl: 'https://files.catbox.moe/tdhhl5.mp3',
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
  }
};

export default alive;
