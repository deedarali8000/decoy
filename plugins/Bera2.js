import config from '../../config.cjs';
import ytSearch from 'yt-search';
import fetch from 'node-fetch';
const DOWNLOAD_APIS = [
    "https://apisnothing.vercel.app/api/download/ytmp3?url=",
    "https://api.siputzx.my.id/api/d/ytmp3?url=",
    "https://ditzdevs-ytdl-api.hf.space/api/ytmp3?url="
];

const play = async (message, client) => {
    const prefix = config.PREFIX;
    const command = message.body.startsWith(prefix) ? message.body.slice(prefix.length).split(" ")[0].toLowerCase() : '';
    const query = message.body.slice(prefix.length + command.length).trim();

    if (command === "play") {
        if (!query) return message.reply("❌ *Please provide a search query!*");
        
        await message.reply("⏳ Searching...");
        try {
            const searchResults = await ytSearch(query);
            if (!searchResults.videos.length) return message.reply("❌ *No results found!*");

            const video = searchResults.videos[0];
            const caption = `🎵 *Title:* ${video.title}\n📺 *Channel:* ${video.author.name}\n👁️ *Views:* ${video.views}\n⏳ *Duration:* ${video.timestamp}\n\n📥 *Choose a format to download:*\n1️⃣ Video\n2️⃣ Audio`;

            const response = await client.sendMessage(message.chat, { image: { url: video.thumbnail }, caption }, { quoted: message });
            const messageId = response.key.id;
            const videoUrl = video.url;

            client.ev.on("messages.upsert", async (msg) => {
                const newMsg = msg.messages[0];
                if (!newMsg.message) return;

                const userResponse = newMsg.message.conversation || newMsg.message.extendedTextMessage?.text;
                const isReplyToBot = newMsg.message.contextInfo?.stanzaId === messageId;

                if (isReplyToBot) {
                    let apiUrl = null;
                    let fileType = "audio";
                    let mimetype = "audio/mpeg";

                    if (userResponse === "1") {
                        apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`;
                        fileType = "video";
                        mimetype = "video/mp4";
                    } else if (userResponse === "2") {
                        apiUrl = await getAvailableMp3Url(videoUrl);
                    } else {
                        return message.reply("❌ *Invalid selection! Please reply with 1 or 2.*");
                    }

                    if (!apiUrl) return message.reply("❌ *All MP3 download APIs failed!*");

                    const downloadResponse = await fetch(apiUrl);
                    const downloadData = await downloadResponse.json();
                    if (!downloadData.success) return message.reply("❌ *Download failed, please try again.*");

                    const downloadUrl = downloadData.result.download_url;
                    await client.sendMessage(message.chat, { [fileType]: { url: downloadUrl }, mimetype }, { quoted: newMsg });
                }
            });

        } catch (error) {
            console.error("Error:", error);
            return message.reply("❌ *An error occurred while processing your request.*");
        }
    }
};

// Function to try multiple MP3 APIs until one works
const getAvailableMp3Url = async (videoUrl) => {
    for (const api of DOWNLOAD_APIS) {
        const testUrl = `${api}${videoUrl}`;
        try {
            const response = await fetch(testUrl);
            const data = await response.json();
            if (data.success) return testUrl;
        } catch (error) {
            console.warn(`API failed: ${api}`);
        }
    }
    return null;
};

export default play;
