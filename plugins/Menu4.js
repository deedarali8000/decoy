const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'menu',
  alias: ['help'],
  category: 'general',
  desc: 'Displays the bot menu',
  async execute(m, { conn, prefix }) {
    const cmd = m.body.trim().toLowerCase().split(/\s+/)[0];

    if (cmd === `${prefix}menu` || cmd === `${prefix}help`) {
      await m.react('⏳'); // React with a loading icon

      const menuText = `
*🤖 ${conn.user.name} - Menu*
-----------------------------------
📌 *General Commands:*
- ${prefix}ping - Check bot status
- ${prefix}info - Bot info
- ${prefix}owner - Contact owner

📌 *Admin Commands:*
- ${prefix}kick @user - Remove user
- ${prefix}promote @user - Make admin
- ${prefix}demote @user - Remove admin

📌 *Fun Commands:*
- ${prefix}joke - Random joke
- ${prefix}meme - Random meme
- ${prefix}quote - Random quote

📌 *Downloader Commands:*
- ${prefix}ytmp3 <url> - Download YouTube MP3
- ${prefix}ytmp4 <url> - Download YouTube MP4
- ${prefix}tiktok <url> - Download TikTok video

💡 Type *${prefix}command* for more details on a specific command.
-----------------------------------
*🌟 Created by Your Name*
`;
      await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });

      await m.react('✅'); // React with a checkmark after sending
    }
  }
};
