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
        console.log(`demon-slayer using WA v${version.join('.')}, isLatest: ${isLatest}`);
        
        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["BERA-TECH", "safari", "3.3"],
            auth: state,
            syncFullHistory: true, // Ensures bot can sync statuses
            defaultQueryTimeoutMs: undefined, // Avoids query timeout issues
            patchMessageBeforeSending: (message) => message,
            markOnlineOnConnect: true, // Keeps bot online
        });

        Matrix.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    start();
                }
            } else if (connection === 'open') {
                if (initialConnection) {
                    console.log(chalk.green("BERA TECH BOT Connected"));
                    Matrix.sendMessage(Matrix.user.id, { 
                        image: { url: "https://files.catbox.moe/7xgzln.jpg" }, 
                        caption: `╭─────────────━┈⊷
│ *BERA TECH BOT*
╰─────────────━┈⊷

╭─────────────━┈⊷
│ *ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ*
⚠️ *Important Notice* ⚠️

To avoid disconnection from the bot, please join our support group:

🔗 https://chat.whatsapp.com/JLFAlCXdXMh8lT4sxHplvG
╰─────────────━┈⊷

> *Regards Bruce Bera*`
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

        // ✅ Auto-View Status & React
        if (config.AUTO_STATUS_SEEN) {
            Matrix.ev.on('status.update', async (status) => {
                try {
                    console.log(`👀 Viewing status: ${status.id}`);
                    await Matrix.readMessages([status.id]); // Marks status as viewed

                    if (config.AUTO_REACT) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, status, Matrix);
                        console.log(`✅ Reacted to status with ${randomEmoji}`);
                    }
                } catch (error) {
                    console.error('❌ Error viewing status:', error);
                }
            });
        }

        // ✅ Anti-Delete
        if (config.ANTI_DELETE) {
            Matrix.ev.on("messages.update", async (updates) => {
                for (const update of updates) {
                    if (update.update.message && update.update.key.fromMe === false) {
                        console.log("Message deleted, recovering...");
                        await Matrix.sendMessage(update.update.key.remoteJid, { text: `*Recovered Message:*\n${update.update.message}` });
                    }
                }
            });
        }

        // ✅ Anti-Left (Re-adds users who leave)
        Matrix.ev.on("group-participants.update", async (update) => {
            if (config.ANTI_LEFT) {
                if (update.action === "remove") {
                    console.log(`${update.participants[0]} left, re-adding...`);
                    await Matrix.groupParticipantsUpdate(update.id, [update.participants[0]], "add");
                }
            }
        });

        // ✅ Auto-Reaction on Messages
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                if (!mek.key.fromMe && config.AUTO_REACT) {
                    if (mek.message) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, mek, Matrix);
                        console.log(`✅ Reacted to message with ${randomEmoji}`);
                    }
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
    res.send('BOT CONNECTED SUCCESSFUL');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// updated by Bera
