

import config from '../../config.cjs';
import path from 'path';


const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const config = require("./config.cjs");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info");
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const sender = msg.key.remoteJid;
        const messageContent = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid;

        if (!messageContent.startsWith(config.prefix)) return;

        const args = messageContent.slice(config.prefix.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        if (command === "hack") {
            if (!mentionedJid || mentionedJid.length === 0) {
                await sock.sendMessage(sender, { text: "❌ *Please tag someone to hack!*" }, { quoted: msg });
                return;
            }

            const target = mentionedJid[0];
            const fakeProgress = [
                "🔍 Scanning user data...",
                "🔑 Extracting passwords...",
                "📂 Downloading WhatsApp chat history...",
                "📵 Disabling security settings...",
                "💀 Hacking complete!"
            ];

            for (const progress of fakeProgress) {
                await sock.sendMessage(sender, { text: progress }, { quoted: msg });
                await delay(2000);
            }

            await sock.sendMessage(sender, { text: `⚠️ *Error: User ${target} has an anti-hack system!*\n❌ Hack failed.` }, { quoted: msg });
        }
    });

    sock.ev.on("connection.update", (update) => {
        if (update.qr) console.log("Scan this QR Code:", update.qr);
    });
}

startBot();
