import axios from 'axios';
import config from '../../config.cjs';

const LogoCmd = async (message, bot) => {
  const prefix = config.PREFIX;
  const userName = message.pushName || "User";
  const command = message.body.startsWith(prefix) ? message.body.slice(prefix.length).split(" ")[0].toLowerCase() : '';

  const sendMessage = async (text) => {
    await bot.sendMessage(message.from, { text }, { quoted: message });
  };

  // Logo styles API list
  const logoStyles = {
    logo: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html&name=",
    blackpink: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html&name=",
    glossysilver: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html&name=",
    Naruto: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html&name=",
    digitalglitch: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html&name=",
    pixelglitch: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html&name=",
    water: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/create-water-effect-text-online-295.html&name=", // Added Water style
    sand: "https://api-pink-venom.vercel.app/api/logo?url=https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html&name=" // Added Sand style
  };

  if (logoStyles[command]) {
    const userInput = message.body.slice(prefix.length + command.length + 1).trim();
    if (!userInput) {
      await sendMessage("⚠️ Please provide text to generate a logo!");
      return;
    }

    try {
      await bot.sendMessage(message.from, { react: { text: '⏳', key: message.key } });

      const apiUrl = logoStyles[command] + encodeURIComponent(userInput);
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status && data.result && data.result.download_url) {
        const imageUrl = data.result.download_url;
        await bot.sendMessage(message.from, { image: { url: imageUrl }, caption: "Here is your logo!" }, { quoted: message });

        await bot.sendMessage(message.from, { react: { text: '✅', key: message.key } });
      } else {
        await sendMessage("⚠️ Failed to generate the logo. Please try again later!");
      }
    } catch (error) {
      console.error(error);
      await sendMessage("⚠️ An error occurred while generating the logo. Please try again later!");
    }
  }
};

export default LogoCmd;
