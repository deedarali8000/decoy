import axios from 'axios';

const RepoCmd = async (m, Matrix) => {
  if (m.body.trim().toLowerCase() !== 'repo') return;

  const repoUrl = 'https://api.github.com/repos/DEVELOPER-BRUCE/BERA-TECH-BOT';

  try {
    const { data } = await axios.get(repoUrl);

    if (!data || !data.owner) return m.reply('*Failed to retrieve repository data!*');

    const repoInfo = `*🔹 BERA TECH BOT 🔹*\n\n` +
                     `👤 *Developer:* DEVELOPER-BRUCE\n` +
                     `📌 *User:* ${data.owner.login}\n` +
                     `📅 *Last Update:* ${new Date(data.updated_at).toLocaleDateString()}\n` +
                     `🔄 *Forks:* ${data.forks_count}\n` +
                     `⭐ *Stars:* ${data.stargazers_count}\n` +
                     `🤖 *Bot Name:* ${data.name}\n\n` +
                     `🔗 *Repository:* [Click Here](https://github.com/DEVELOPER-BRUCE/BERA-TECH-BOT)`;

    await Matrix.sendMessage(m.from, { text: repoInfo }, { quoted: m });

  } catch (error) {
    console.error(error);
    const errorMsg = error.response?.status === 403 
      ? '*GitHub API rate limit exceeded. Try again later!*' 
      : '*Failed to fetch repository details!*';
    await m.reply(errorMsg);
  }
};

// Coded by Bera
export default RepoCmd;
