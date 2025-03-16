const fs = require("fs");
require("dotenv").config();

const config = {
  SESSION_ID: process.env.SESSION_ID || "",  // Your session ID (paste it in .env)
  
  PREFIX: process.env.PREFIX || '.',  // Command Prefix

  // AutoBio & Auto Features
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN === 'true',  // Auto view statuses
  AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY === 'true', // Auto reply to status
  STATUS_READ_MSG: process.env.STATUS_READ_MSG || '', // Custom message for auto status reply

  AUTO_DL: process.env.AUTO_DL === 'true',  // Auto-download media
  AUTO_READ: process.env.AUTO_READ === 'true', // Auto-read messages
  AUTO_TYPING: process.env.AUTO_TYPING === 'true', // Show typing status
  AUTO_RECORDING: process.env.AUTO_RECORDING === 'true', // Show recording status
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE === 'true', // Keep bot online
  AUTO_REACT: process.env.AUTO_REACT === 'true',  // Enable auto-reactions

  // Anti-Delete & Security
  AUTO_BLOCK: process.env.AUTO_BLOCK === 'true', // Auto block spam (212 country code)
  REJECT_CALL: process.env.REJECT_CALL === 'true',  // Reject calls automatically
  NOT_ALLOW: process.env.NOT_ALLOW === 'true',  // Restrict bot usage in certain cases

  // Bot Mode
  MODE: process.env.MODE || "public",  // Set to "public" or "private"

  // Owner Information
  OWNER_NAME: process.env.OWNER_NAME || "BRUCE BERA",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "254743982206",

  // API Keys (Modify if needed)
  GEMINI_KEY: process.env.GEMINI_KEY || "",

  // Welcome Feature
  WELCOME: process.env.WELCOME === 'true',  // Enable welcome messages
};

module.exports = config;
