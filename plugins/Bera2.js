import fetch from "node-fetch";
import config from "../../config.cjs";

const playCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";

  if (cmd === "play") {
    const query = m.body.slice(prefix.length + cmd.length).trim();
    if (!query) {
      return await sock.sendMessage(m.from, { text: "❌ *Please provide a song name or YouTube link.*" }, { quoted: m });
    }

    try {
      await sock.sendMessage(m.from, { text: "🔎 *Searching for your song...*" }, { quoted: m });

      // Search YouTube for the video
      const searchUrl = `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(query)}`;
      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!data.status || !data.result || !data.result.url) {
        return await sock.sendMessage(m.from, { text: "❌ *Failed to fetch audio. Try another search.*" }, { quoted: m });
      }

      const { title, url, thumb } = data.result;

      await sock.sendMessage(m.from, { 
        image: { url: thumb },
        caption: `🎶 *Title:* ${title}\n📥 *Downloading audio...*`
      }, { quoted: m });

      await sock.sendMessage(m.from, {
        audio: { url },
        mimetype: "audio/mp4",
        fileName: `${title}.mp3`,
      }, { quoted: m });

    } catch (error) {
      console.error("❌ Play Command Error:", error);
      await sock.sendMessage(m.from, { text: "❌ *Error fetching audio. Please try again later.*" }, { quoted: m });
    }
  }
};

export default playCommand;
