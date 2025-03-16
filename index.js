import dotenv from 'dotenv';
dotenv.config();

import {
  makeWASocket,
  fetchLatestBaileysVersion,
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './data/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import NodeCache from 'node-cache';
import path from 'path';
import chalk from 'chalk';
import moment from 'moment-timezone';
import axios from 'axios';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
const { emojis, doReact } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;
let useQR = false;
let initialConnection = true;

const MAIN_LOGGER = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const msgRetryCounterCache = new NodeCache();
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

async function downloadSessionData() {
  if (!config.SESSION_ID) {
    console.error('Please add your session to SESSION_ID env !!');
    return false;
  }
  const sessdata = config.SESSION_ID.split("BERA-TECH$")[1];
  const url = `https://pastebin.com/raw/${sessdata}`;
  try {
    const response = await axios.get(url);
    const data =
      typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data);
    await fs.promises.writeFile(credsPath, data);
    console.log("🔒 Session Successfully Loaded !!");
    return true;
  } catch (error) {
    return false;
  }
}

async function start() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Bot using WA v${version.join('.')}, isLatest: ${isLatest}`);

    const Matrix = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: useQR,
      browser: ["BERA-TECH", "safari", "3.3"],
      auth: state,
      // Enable full history sync (helps with status viewing)
      syncFullHistory: true,
      markOnlineOnConnect: true,
    });

    Matrix.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === 'close') {
        if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          start();
        }
      } else if (connection === 'open') {
        if (initialConnection) {
          console.log(chalk.green("✅ Bot Connected"));
          Matrix.sendMessage(Matrix.user.id, {
            image: { url: "https://files.catbox.moe/7xgzln.jpg" },
            caption: `╭─────────────━┈⊷
│ *BERA TECH BOT*
╰─────────────━┈⊷

⚠️ Join our support group to avoid disconnection:
🔗 https://chat.whatsapp.com/JLFAlCXdXMh8lT4sxHplvG

> *Regards Bruce Bera*`,
          });
          initialConnection = false;
        } else {
          console.log(chalk.blue("♻️ Connection reestablished after restart."));
        }
      }
    });

    Matrix.ev.on('creds.update', saveCreds);

    Matrix.ev.on("messages.upsert", async (chatUpdate) => {
      await Handler(chatUpdate, Matrix, logger);
    });
    Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
    Matrix.ev.on("group-participants.update", async (update) => {
      await GroupUpdate(Matrix, update);
      // Anti-Left: If a member leaves and ANTI_LEFT is enabled, re-add them.
      if (config.ANTI_LEFT && update.action === "remove") {
        try {
          console.log(`🔄 Re-adding ${update.participants[0]} after leaving.`);
          await Matrix.groupParticipantsUpdate(update.id, [update.participants[0]], "add");
          await Matrix.sendMessage(update.id, { text: config.ANTI_LEFT_MSG || "🚨 You cannot leave this group! You've been added back automatically." });
        } catch (err) {
          console.error("❌ Error re-adding member:", err);
        }
      }
    });

    if (config.MODE === "public") {
      Matrix.public = true;
    } else if (config.MODE === "private") {
      Matrix.public = false;
    }

    // Auto-React & Status View
    Matrix.ev.on('messages.upsert', async (chatUpdate) => {
      try {
        const mek = chatUpdate.messages[0];
        // Auto-react to messages
        if (!mek.key.fromMe && config.AUTO_REACT) {
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          await doReact(randomEmoji, mek, Matrix);
          console.log(`✅ Reacted to message with ${randomEmoji}`);
        }

        // Auto View & React to Status (for broadcast messages)
        if (mek.key.remoteJid.endsWith('@broadcast') && mek.message?.imageMessage) {
          try {
            await Matrix.readMessages([mek.key]);
            console.log(chalk.green(`✅ Viewed status from ${mek.key.participant || mek.key.remoteJid}`));
            if (config.AUTO_REACT) {
              const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
              await doReact(randomEmoji, mek, Matrix);
              console.log(`✅ Reacted to status with ${randomEmoji}`);
            }
          } catch (error) {
            console.error('❌ Error marking status as viewed:', error);
          }
        }
      } catch (err) {
        console.error('Error during auto reaction/status viewing:', err);
      }
    });

    // Anti-Delete: Send deleted message details to the user's DM
    if (config.ANTI_DELETE) {
      Matrix.ev.on("messages.update", async (updates) => {
        try {
          for (const update of updates) {
            if (update.update.message && !update.update.key.fromMe) {
              const deletedMessage = update.update.message;
              const senderJid = update.update.key.participant || update.update.key.remoteJid;
              if (!deletedMessage) continue;

              let messageContent = "🔹 *A message was deleted!*";
              const messageType = Object.keys(deletedMessage)[0];
              if (messageType === "conversation") {
                messageContent += `\n\n💬 *Message:* ${deletedMessage.conversation}`;
              } else if (messageType === "extendedTextMessage") {
                messageContent += `\n\n💬 *Message:* ${deletedMessage.extendedTextMessage.text}`;
              } else if (messageType === "imageMessage") {
                messageContent += "\n\n🖼 *An image was deleted!*";
              } else if (messageType === "videoMessage") {
                messageContent += "\n\n🎥 *A video was deleted!*";
              }
              // Send the deleted message details to the user's DM
              await Matrix.sendMessage(senderJid, { text: messageContent });
              console.log(`📩 Sent deleted message details to ${senderJid}`);
            }
          }
        } catch (err) {
          console.error("❌ Antidelete Error:", err);
        }
      });
    }

    // Auto-Bio Feature: Update bio every 10 minutes with a random Juice WRLD quote
    if (config.AUTO_BIO) {
      setInterval(async () => {
        const juiceWrldQuotes = [
          "💔 Legends never die.",
          "🌧️ I still see your shadows in my room.",
          "🔥 I cannot change you, so I must replace you.",
          "🌪️ Wishing well of lost souls.",
          "🌟 999 till infinity."
        ];
        const randomQuote = juiceWrldQuotes[Math.floor(Math.random() * juiceWrldQuotes.length)];
        await Matrix.updateProfileStatus(randomQuote);
        console.log(`🔄 Updated Bio: ${randomQuote}`);
      }, 10 * 60 * 1000); // 10 minutes
    }
    
  } catch (error) {
    console.error('Critical Error:', error);
    process.exit(1);
  }
}

async function init() {
  if (fs.existsSync(credsPath)) {
    console.log("🔒 Session file found, proceeding without QR code.");
    await start();
  } else {
    const sessionDownloaded = await downloadSessionData();
    if (sessionDownloaded) {
      console.log("🔒 Session downloaded, starting bot.");
      await start();
    } else {
      console.log("No session found or downloaded, QR code will be printed for authentication.");
      useQR = true;
      await start();
    }
  }
}

init();

app.get('/', (req, res) => {
  res.send('✅ BOT CONNECTED SUCCESSFULLY');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
