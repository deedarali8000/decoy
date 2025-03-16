import dotenv from 'dotenv';
dotenv.config();

import {
  makeWASocket,
  Browsers,
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
    const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
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
    console.log(`Using WA v${version.join('.')}, isLatest: ${isLatest}`);

    const Matrix = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: useQR,
      browser: ["BERA-TECH", "safari", "3.3"],
      auth: state,
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
            text: "🎉 BERA-TECH Bot is online!"
          });
          initialConnection = false;
        }
      }
    });

    Matrix.ev.on('creds.update', saveCreds);
    Matrix.ev.on("messages.upsert", async chatUpdate => await Handler(chatUpdate, Matrix, logger));
    Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
    Matrix.ev.on("group-participants.update", async (message) => await GroupUpdate(Matrix, message));

    if (config.MODE === "public") {
      Matrix.public = true;
    } else if (config.MODE === "private") {
      Matrix.public = false;
    }

    // Auto-React & Status View
    Matrix.ev.on('messages.upsert', async (chatUpdate) => {
      try {
        const mek = chatUpdate.messages[0];
        if (!mek.key.fromMe && config.AUTO_REACT) {
          const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
          await doReact(randomEmoji, mek, Matrix);
        }
      } catch (err) {
        console.error('Error during auto reaction:', err);
      }
    });

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
