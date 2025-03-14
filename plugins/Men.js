import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';

const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';

// Function to format bytes into KB, MB, or GB
function formatBytes(bytes) {
  if (bytes >= 1024 ** 3) {
    return (bytes / 1024 ** 3).toFixed(2) + ' GB';
  } else if (bytes >= 1024 ** 2) {
    return (bytes / 1024 ** 2).toFixed(2) + ' MB';
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' KB';
  } else {
    return bytes + ' bytes';
  }
}

// System Memory Details
const totalMemory = formatBytes(os.totalmem());
const freeMemory = formatBytes(os.freemem());

// Bot Uptime
const uptime = process.uptime();
const days = Math.floor(uptime / (24 * 3600));
const hours = Math.floor((uptime % (24 * 3600)) / 3600);
const minutes = Math.floor((uptime % 3600) / 60);
const seconds = Math.floor(uptime % 60);
const uptimeMessage = `I have been running for *${days}d ${hours}h ${minutes}m ${seconds}s*`;

// Time Greetings Based on User Timezone
const timeNow = moment().tz("Asia/Colombo").format("HH:mm:ss");
let greeting;

if (moment(timeNow, "HH:mm:ss").isBefore("05:00:00")) {
  greeting = "Good Morning 🌄";
} else if (moment(timeNow, "HH:mm:ss").isBefore("11:00:00")) {
  greeting = "Good Morning 🌄";
} else if (moment(timeNow, "HH:mm:ss").isBefore("15:00:00")) {
  greeting = "Good Afternoon 🌅";
} else if (moment(timeNow, "HH:mm:ss").isBefore("19:00:00")) {
  greeting = "Good Evening 🌃";
} else {
  greeting = "Good Night 🌌";
}

// Main Bot Function
const botHandler = async (m, Matrix) => {
  let selectedListId;
  const selectedButtonId = m?.message?.templateButtonReplyMessage?.selectedId;
  const interactiveResponseMessage = m?.message?.interactiveResponseMessage;
  
  if (interactiveResponseMessage) {
    const paramsJson = interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson;
    if (paramsJson) {
      const params = JSON.parse(paramsJson);
      selectedListId = params.id;
    }
  }
  
  const selectedId = selectedListId || selectedButtonId;
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const mode = config.MODE === 'public' ? 'public' : 'private';
  const pref = config.PREFIX;
  
  const validCommands = ['list', 'help', 'menu1'];
  if (validCommands.includes(cmd)) {
    let msg = generateWAMessageFromContent(m.from, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.create({
            body: proto.Message.InteractiveMessage.Body.create({
              text: `╭─────────────━┈⊷
│🤖 Bot Name: *BERA TECH*
│📍 Version: 2.1.0
│👨‍💻 Owner: *BERA TECH TEAM*      
│📡 Platform: *${os.platform()}*
│🛡 Mode: *${mode}*
│💫 Prefix: [${pref}]
│🔋 RAM Usage: *${freeMemory} / ${totalMemory}*
│🕰 Uptime: *${days}d ${hours}h ${minutes}m ${seconds}s*
╰─────────────━┈⊷`
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: "© Powered by BERA TECH"
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              ...(await prepareWAMessageMedia(
                { image: fs.readFileSync('./src/bera.jpg') },
                { upload: Matrix.waUploadToServer }
              )),
              title: ``,
              gifPlayback: true,
              subtitle: "",
              hasMediaAttachment: false  
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
              buttons: [
                {
                  "name": "quick_reply",
                  "buttonParamsJson": JSON.stringify({
                    display_text: "ALIVE",
                    id: `${prefix}alive`
                  })
                },
                {
                  "name": "quick_reply",
                  "buttonParamsJson": JSON.stringify({
                    display_text: "PING",
                    id: `${prefix}ping`
                  })
                }
              ],
            }),
            contextInfo: {
              quotedMessage: m.message,
              mentionedJid: [m.sender], 
              forwardingScore: 999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: '120363249960769123@newsletter',
                newsletterName: "BERA TECH",
                serverMessageId: 143
              }
            }
          }),
        },
      },
    }, {});

    await Matrix.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id
    });
  }

  if (selectedId == "View All Menu") {
    const menuMessage = `Hey ${m.pushName}, ${greeting}
╭─────────────━┈⊷
│🤖 Bot Name: *BERA TECH*
│📍 Version: 2.0.3
│👨‍💻 Owner: *BERA TECH TEAM*      
│💻 Platform: *${os.platform()}*
│🛡 Mode: *${config.MODE}*
│💫 Prefix: [${pref}]
│🔋 RAM Usage: *${freeMemory} / ${totalMemory}*
│🕰 Uptime: *${days}d ${hours}h ${minutes}m ${seconds}s*
╰─────────────━┈⊷

*🛠 Available Commands:*
1️⃣ ${prefix}help - Show all commands
2️⃣ ${prefix}ping - Check bot speed
3️⃣ ${prefix}alive - Check bot status
4️⃣ ${prefix}owner - Contact owner
5️⃣ ${prefix}menu - Show menu list

📌 *Use '${prefix}command' to run any command!*
📢 Stay updated with *BERA TECH* 🚀`;

    await Matrix.sendMessage(m.from, { text: menuMessage }, { quoted: m });
  }
};

export default botHandler;
