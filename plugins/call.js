module.exports = {
    prefix: ".", // Change this to your desired prefix
    ownerNumber: "254743982206@s.whatsapp.net", // Your WhatsApp number
};
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const config = require(".../config.cjs"); // Correct import

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

        if (!messageContent.startsWith(config.prefix)) return;

        const args = messageContent.slice(config.prefix.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        if (command === "call") {
            await sock.sendMessage(sender, { text: "WhatsApp Web does not support calls via API." });
        }
    });

    sock.ev.on("connection.update", (update) => {
        if (update.qr) console.log("Scan this QR Code:", update.qr);
    });
}

startBot();
