import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg;
import axios from 'axios';
import config from '../../config.cjs';

const searchRepo = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === 'repo') {
    const repoUrl = `https://api.github.com/repos/DEVELOPER-BRUCE/BERA-TECH-BOT`;
    await handleRepoCommand(m, Matrix, repoUrl);
  }
};

const handleRepoCommand = async (m, Matrix, repoUrl) => {
  try {
    const response = await axios.get(repoUrl);
    const repoData = response.data;

    const {
      name,
      forks_count,
      stargazers_count,
      created_at,
      updated_at,
      owner,
      html_url
    } = repoData;

    const messageText = `*🔹 Repository Information:*\n
🔹 *Name:* ${name}
⭐ *Stars:* ${stargazers_count}
🍴 *Forks:* ${forks_count}
📅 *Created:* ${new Date(created_at).toLocaleDateString()}
♻️ *Last Updated:* ${new Date(updated_at).toLocaleDateString()}
👤 *Owner:* ${owner.login}`;

    const repoImage = await prepareWAMessageMedia({
      image: { url: 'https://files.catbox.moe/heylal.jpg' }
    }, { upload: Matrix.waUploadToServer });

    const repoMessage = generateWAMessageFromContent(m.from, {
      templateMessage: {
        hydratedTemplate: {
          hydratedContentText: messageText,
          locationMessage: repoImage.imageMessage,
          hydratedFooterText: '© Powered by BERA TECH',
          hydratedButtons: [
            {
              urlButton: {
                displayText: '🌐 Visit Repo',
                url: html_url
              }
            },
            {
              quickReplyButton: {
                displayText: '🔄 Refresh',
                id: `${config.PREFIX}repo`
              }
            }
          ]
        }
      }
    }, {});

    await Matrix.relayMessage(m.chat, repoMessage.message, { messageId: repoMessage.key.id });
    await m.react('✅');
  } catch (error) {
    console.error('Error processing your request:', error);
    m.reply('❌ Error fetching repository data.');
    await m.react('❌');
  }
};

export default searchRepo;
