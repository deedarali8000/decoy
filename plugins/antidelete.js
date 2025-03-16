const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../config.cjs");

// Function to update config
const updateConfig = (key, value) => {
    let config = require(configPath);
    config[key] = value;
    fs.writeFileSync(configPath, `module.exports = ${JSON.stringify(config, null, 4)}`);
};

module.exports = {
    name: "antidelete",
    alias: ["antideleteon", "antideleteoff"],
    category: "group",
    desc: "Enable or disable message recovery",
    async exec(msg, conn, args) {
        if (!msg.isGroup) return msg.reply("❌ This command only works in groups.");
        if (!msg.isAdmin) return msg.reply("❌ Only group admins can use this command.");

        const option = args[0]?.toLowerCase();
        if (option === "on") {
            updateConfig("ANTI_DELETE", true);
            return msg.reply("✅ *Antidelete enabled!* Deleted messages will be recovered.");
        } else if (option === "off") {
            updateConfig("ANTI_DELETE", false);
            return msg.reply("❌ *Antidelete disabled!* Deleted messages will not be recovered.");
        } else {
            return msg.reply("⚙️ Use: *!antidelete on* or *!antidelete off*");
        }
    }
};
