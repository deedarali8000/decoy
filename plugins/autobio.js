import config from "../config.cjs";

const updateBio = async (sock) => {
    if (!config.AUTO_BIO) return;

    const randomQuote = config.BIO_TEXTS[Math.floor(Math.random() * config.BIO_TEXTS.length)];
    const bioText = randomQuote.replace("{time}", new Date().toLocaleTimeString());

    try {
        await sock.updateProfileStatus(bioText);
        console.log(`✅ Auto Bio Updated: ${bioText}`);
    } catch (err) {
        console.error("❌ Failed to update bio:", err);
    }
};

// Run bio update every 10 minutes
setInterval(() => {
    updateBio(sock);
}, 10 * 60 * 1000);

export default updateBio;
