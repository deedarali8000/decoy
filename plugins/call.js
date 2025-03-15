module.exports = {
    prefix: ".", // Change this to your desired prefix
    ownerNumber: "254743982206@s.whatsapp.net", // Your WhatsApp number
};
const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const { prefix } = require("./config.cjs");

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

        if (!messageContent.startsWith(prefix)) return;

        const args = messageContent.slice(prefix.length).trim().split(/\s+/);
        const command = args.shift().toLowerCase();

        if (command === "call") {
            if (args.length === 0) {
                await sock.sendMessage(sender, { text: "Please provide a phone number to call!" });
                return;
            }

            const phoneNumber = args[0].replace(/[^0-9]/g, "") + "@s.whatsapp.net"; // Sanitize input

            try {
                await sock.sendCall(phoneNumber);
                await sock.sendMessage(sender, { text: `Calling ${args[0]}...` });
            } catch (error) {
                console.error("Call failed:", error);
                await sock.sendMessage(sender, { text: "Failed to make the call." });
            }
        }
    });
}

startBot();
