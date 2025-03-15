import config from "../../config.cjs";
import fs from "fs";

const settingsPath = "./data/antidel.js";

// Load or initialize settings
let antiDeleteSettings = {};
if (fs.existsSync(settingsPath)) {
  antiDeleteSettings = JSON.parse(fs.readFileSync(settingsPath));
}

// Save settings
const saveSettings = () => {
  fs.writeFileSync(settingsPath, JSON.stringify(antiDeleteSettings, null, 2));
};

const antiDeleteCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const args = m.body.slice(prefix.length).trim().split(/ +/);
  const cmd = args[0].toLowerCase();
  const option = args[1]?.toLowerCase();
  const chatId = m.from;

  if (cmd === "antidelete") {
    if (!m.isGroup) {
      return await sock.sendMessage(chatId, { text: "❌ *This command only works in groups!*" }, { quoted: m });
    }

    // Check if the bot is an admin
    const groupMetadata = await sock.groupMetadata(chatId);
    const botNumber = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    const isBotAdmin = groupMetadata.participants.some(p => p.id === botNumber && p.admin);

    if (!isBotAdmin) {
      return await sock.sendMessage(chatId, { text: "❌ *I need to be an admin to enable anti-delete!*" }, { quoted: m });
    }

    if (option === "on") {
      antiDeleteSettings[chatId] = true;
      saveSettings();
      return await sock.sendMessage(chatId, { text: "✅ *Anti-Delete is now activated! Deleted messages will be recovered.*" }, { quoted: m });
    } else if (option === "off") {
      delete antiDeleteSettings[chatId];
      saveSettings();
      return await sock.sendMessage(chatId, { text: "❌ *Anti-Delete has been deactivated!*" }, { quoted: m });
    } else {
      return await sock.sendMessage(chatId, { text: "⚠️ Use: `!antidelete on` or `!antidelete off`" }, { quoted: m });
    }
  }
};

const messageRevokeHandler = async (m, sock) => {
  const chatId = m.key.remoteJid;

  if (antiDeleteSettings[chatId] && m.key.fromMe === false && m.message) {
    const sender = m.key.participant || m.key.remoteJid;
    const messageType = Object.keys(m.message)[0];

    let msgContent = "";
    if (messageType === "conversation") {
      msgContent = m.message.conversation;
    } else if (messageType === "extendedTextMessage") {
      msgContent = m.message.extendedTextMessage.text;
    } else if (messageType === "imageMessage") {
      msgContent = "*[Deleted Image]*";
    } else if (messageType === "videoMessage") {
      msgContent = "*[Deleted Video]*";
    } else {
      msgContent = "*[Deleted Message]*";
    }

    const recoveryMessage = `🚨 *Anti-Delete Alert!*
🔹 *Sender:* @${sender.split("@")[0]}
🔹 *Message:* ${msgContent}`;

    await sock.sendMessage(chatId, { text: recoveryMessage, mentions: [sender] }, { quoted: m });

    if (messageType === "imageMessage" || messageType === "videoMessage") {
      await sock.sendMessage(chatId, { [messageType]: m.message[messageType] }, { quoted: m });
    }
  }
};

export { antiDeleteCommand, messageRevokeHandler };
