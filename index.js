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
import moment from 'moment-timezone';
import axios from 'axios';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
const { emojis, doReact } = pkg;

const sessionName = "session";
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
        console.log(`Bot running on WA v${version.join('.')}, isLatest: ${isLatest}`);
        
        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["demon", "safari", "3.3"],
            auth: state,
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg.message || undefined;
                }
                return { conversation: "demon-slayer whatsapp bot" };
            }
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
                        caption: `🤖 *Bot Successfully Connected!*
⚠️ Join our support group to avoid disconnection:
🔗 https://chat.whatsapp.com/JLFAlCXdXMh8lT4sxHplvG
👑 *Developer: Bruce Bera*`
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

        // Auto-React on Messages
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];

                if (!mek.key.fromMe && config.AUTO_REACT) {
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await doReact(randomEmoji, mek, Matrix);
                }

                // Auto View & React to Status
                if (mek.key.remoteJid.endsWith('@broadcast') && mek.message?.imageMessage) {
                    try {
                        await Matrix.readMessages([mek.key]);
                        console.log(chalk.green(`✅ Viewed status from ${mek.key.participant || mek.key.remoteJid}`));

                        // React to status if enabled
                        if (config.AUTO_STATUS_REACT) {
                            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                            await doReact(randomEmoji, mek, Matrix);
                        }
                    } catch (error) {
                        console.error('❌ Error marking status as viewed:', error);
                    }
                }
                
            } catch (err) {
                console.error('Error during auto reaction/status viewing:', err);
            }
        });

        // **Antidelete Feature**
        Matrix.ev.on("messages.update", async (updates) => {
            if (!config.ANTI_DELETE) return;

            for (const update of updates) {
                if (update.update.message && !update.update.key.fromMe) {
                    console.log("Message deleted, recovering...");
                    await Matrix.sendMessage(update.update.key.remoteJid, { 
                        text: `🔁 *Recovered Message:*\n${update.update.message}` 
                    });
                }
            }
        });

        // **Antitag Feature**
        Matrix.ev.on("messages.upsert", async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (config.ANTI_TAG && mek.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
                    console.log("User tagged the bot, auto-replying...");
                    await Matrix.sendMessage(mek.key.remoteJid, { text: "🚫 Don't tag me unnecessarily!" });
                }
            } catch (err) {
                console.error("Antitag Error:", err);
            }
        });

        // **Auto Bio Feature**
        if (config.AUTO_BIO) {
            setInterval(async () => {
                const bios = [
                    "💻 Coding life, debugging dreams",
                    "🚀 Hustle, Build, Repeat",
                    "🎶 'Legends Never Die' - Juice WRLD",
                    "🔄 Keep Moving Forward"
                ];
                const newBio = bios[Math.floor(Math.random() * bios.length)];
                await Matrix.updateProfileStatus(newBio);
                console.log(`🔄 Updated Bio: ${newBio}`);
            }, 600000); // Update bio every 10 minutes
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
