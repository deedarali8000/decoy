import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
    jidNormalizedUser
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
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

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
            browser: ["demon", "safari", "3.3"],
            auth: state,
            getMessage: async (key) => {
                return { conversation: "demon-slayer whatsapp user bot" };
            }
        });

        // Juice WRLD Quotes for AutoBio
        const juiceWRLDQuotes = [
            "Legends never die.",
            "The goal in life is not to live forever, but to create something that will.",
            "I'm running out of time, I'm running out of patience.",
            "Telling you right now, all you'll find is a lost soul, rich and blind.",
            "We ain't making it past 21.",
            "Exhale depression as the wind blows.",
            "I still see your shadows in my room.",
            "You left me falling and landing inside my grave.",
            "I’m your everything, but you’re my first priority.",
            "I stay to myself a lot.",
            "You found another one, but I am the better one."
        ];

        // AutoBio Function
        async function autoBio() {
            const randomQuote = juiceWRLDQuotes[Math.floor(Math.random() * juiceWRLDQuotes.length)];
            await Matrix.updateProfileStatus(randomQuote);
            console.log(`✅ AutoBio Updated: ${randomQuote}`);
        }
        setInterval(autoBio, 60 * 1000); // Update bio every 1 minute

        Matrix.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    start();
                }
            } else if (connection === 'open') {
                if (initialConnection) {
                    console.log(chalk.green("Demon slayer Connected"));
                    Matrix.sendMessage(Matrix.user.id, { 
                        image: { url: "https://files.catbox.moe/7xgzln.jpg" }, 
                        caption: `╭─────────────━┈⊷
│ *BERA TECH BOT*
╰─────────────━┈⊷

╭─────────────━┈⊷
│ *ʙᴏᴛ ᴄᴏɴɴᴇᴄᴛᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ*
│ *ᴘʟᴇᴀsᴇ ғᴏʟʟᴏᴡ ᴜs ʙᴇʟᴏᴡ*
╰─────────────━┈⊷

> *Regards Bruce Bera*`
                    });
                    initialConnection = false;
                }
            }
        });

        Matrix.ev.on('creds.update', saveCreds);

        // Anti-Delete Feature
        Matrix.ev.on("messages.update", async (update) => {
            for (const msg of update) {
                if (msg.update?.messageStubType === 68) { // 68 = message deleted
                    const jid = msg.key.remoteJid;
                    const sender = msg.key.participant || jid;
                    console.log(`⚠️ Message Deleted: ${jid}`);
                    Matrix.sendMessage(jid, { 
                        text: `🚫 *Anti-Delete:* Message from @${sender.split("@")[0]} was deleted!` 
                    }, { mentions: [jidNormalizedUser(sender)] });
                }
            }
        });

        // Auto View Status Fix
        Matrix.ev.on("presence.update", async (presence) => {
            if (presence.lastKnownPresence === "composing") {
                try {
                    const statuses = await Matrix.fetchStatus(presence.id);
                    if (statuses.length > 0) {
                        for (const status of statuses) {
                            await Matrix.readMessages([status.key]);
                        }
                        console.log(`✅ Auto Viewed ${statuses.length} statuses.`);
                    }
                } catch (err) {
                    console.error("❌ Auto View Status Error:", err);
                }
            }
        });

        Matrix.ev.on("messages.upsert", async chatUpdate => await Handler(chatUpdate, Matrix, logger));
        Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
        Matrix.ev.on("group-participants.update", async (messag) => await GroupUpdate(Matrix, messag));

        if (config.MODE === "public") {
            Matrix.public = true;
        } else if (config.MODE === "private") {
            Matrix.public = false;
        }

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
        await start();
    } else {
        const sessionDownloaded = await downloadSessionData();
        if (sessionDownloaded) {
            await start();
        } else {
            useQR = true;
            await start();
        }
    }
}

init();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Updated by Bera
