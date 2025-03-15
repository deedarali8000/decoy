import config from "./config.cjs";

const antiMedia = async (message, sock) => {
    const chatId = message.key.remoteJid;
    const mediaTypes = ["imageMessage", "videoMessage", "documentMessage", "stickerMessage"];

    for (const type of mediaTypes) {
        if (message.message[type]) {
            await sock.sendMessage(chatId, { text: "🚫 Media messages are not allowed!" });
            await sock.deleteMessage(chatId, message.key);
            break;
        }
    }
};

export default antiMedia;
