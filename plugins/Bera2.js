import axios from "axios";
import config from "../../config.cjs";

const playCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const args = m.body.slice(prefix.length).trim().split(/ +/);
  const cmd = args[0].toLowerCase();
  const query = args.slice(1).join(" ");

  if (cmd !== "play") return;

  if (!query) {
    return await sock.sendMessage(m.from, { text: "⚠️ *Please provide a song name or YouTube link!*" }, { quoted: m });
  }

  try {
    // Search YouTube for the video URL
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const searchResponse = await axios.get(searchUrl);
    const videoIdMatch = searchResponse.data.match(/"videoId":"(.*?)"/);

    if (!videoIdMatch) {
      return await sock.sendMessage(m.from, { text: "❌ *No results found!*" }, { quoted: m });
    }

    const videoId = videoIdMatch[1];
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    await sock.sendMessage(m.from, { text: "🔍 *Searching for the best audio source...*" }, { quoted: m });

    // Try first API
    let audioData;
    try {
      const response1 = await axios.get(`https://ditzdevs-ytdl-api.hf.space/api/ytmp3?url=${videoUrl}`);
      if (response1.data && response1.data.url) {
        audioData = response1.data;
      }
    } catch (error) {
      console.log("API 1 failed, switching to backup.");
    }

    // Try second API if the first one fails
    if (!audioData) {
      const response2 = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${videoUrl}`);
      if (response2.data && response2.data.url) {
        audioData = response2.data;
      }
    }

    if (!audioData) {
      return await sock.sendMessage(m.from, { text: "❌ *Failed to fetch audio. Try another song!*" }, { quoted: m });
    }

    // Send the audio file
    const audioMessage = {
      audio: { url: audioData.url },
      mimetype: "audio/mp4",
      ptt: false,
      fileName: `${audioData.title}.mp3`,
      caption: `🎵 *BERA TECH DOWNLOADER*\n\n🔹 *Title:* ${audioData.title}\n🔹 *Duration:* ${audioData.duration}\n🔹 *Size:* ${audioData.filesize}\n\n🎧 *Enjoy your music!*`,
      footer: "Regards, Bruce Bera"
    };

    await sock.sendMessage(m.from, audioMessage, { quoted: m });

  } catch (error) {
    console.error("Error in play command:", error);
    await sock.sendMessage(m.from, { text: "❌ *An error occurred while downloading the audio.*" }, { quoted: m });
  }
};

export default playCommand;
