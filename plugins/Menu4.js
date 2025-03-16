import axios from 'axios';

const PlayCmd = async (m, Matrix) => {
  const query = m.body.trim().slice(5).trim(); // Extract query after "Play"
  if (!query) return m.reply('*Please provide a song name or YouTube link!*');

  let videoUrl = query.startsWith('http') ? query : null;

  try {
    // If the user provided a song name, perform a YouTube search
    if (!videoUrl) {
      const searchUrl = `https://ytsearch.com/api/search?query=${encodeURIComponent(query)}`;
      const searchResponse = await axios.get(searchUrl);
      const firstResult = searchResponse.data.results?.[0];
      
      if (!firstResult) return m.reply('*No results found!*');
      videoUrl = firstResult.url;
    }

    // First API attempt
    let res = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp3?url=${videoUrl}`);
    if (!res.data || !res.data.result) throw new Error('API 1 failed');

    let audioUrl = res.data.result.url;
    let title = res.data.result.title;

    // If first API fails, try the second
  } catch (error) {
    console.log('API 1 failed, trying API 2...');
    try {
      let res = await axios.get(`https://apis.davidcyriltech.my.id/youtube/mp3?url=${videoUrl}`);
      if (!res.data || !res.data.url) throw new Error('API 2 failed');

      audioUrl = res.data.url;
      title = res.data.title;
    } catch (error) {
      return m.reply('*Failed to download the song from both sources!*');
    }
  }

  await Matrix.sendMessage(m.from, { 
    audio: { url: audioUrl }, 
    mimetype: 'audio/mp4', 
    fileName: `${title}.mp3`,
    ptt: false 
  });

  await m.reply(`🎶 *Playing:* ${title}\n🔗 ${videoUrl}`);
};

// Coded by Bera
export default PlayCmd;
