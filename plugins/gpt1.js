import config from "../../config.cjs";
import fetch from "node-fetch";

const GPT_API = "https://api.dreaded.site/api/chatgpt?text=";

const gptCode = async (message, client) => {
    const prefix = config.PREFIX;
    const args = message.body.slice(prefix.length).trim().split(" ");
    const command = args[0].toLowerCase();
    const query = args.slice(1).join(" ");

    if (command !== "gptcode") return;

    if (!query) return message.reply("❌ *Please provide a coding request!*\nExample: `!gptcode HTML form`");

    await message.reply("🤖 *Generating code, please wait...*");
    try {
        const response = await fetch(`${GPT_API}${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!data || !data.result) return message.reply("❌ *Failed to generate code. Try again!*");

        const codeSnippet = "```" + data.result.trim() + "```";
        const buttons = [
            { quickReplyButton: { displayText: "Copy Code", id: "copy_code" } }
        ];

        await client.sendMessage(message.chat, { text: `💻 *Generated Code:*\n\n${codeSnippet}`, footer: "Powered by GPT\nRegards, Bruce Bera", templateButtons: buttons }, { quoted: message });

    } catch (error) {
        console.error("GPT Code Error:", error);
        message.reply("❌ *Error generating code. Please try again later.*");
    }
};

export default gptCode;
