const fs = require("fs");
require("dotenv").config();

const config = {
  SESSION_ID: process.env.SESSION_ID || "Your Session Id",
  PREFIX: process.env.PREFIX || '.',
  AUTO_STATUS_SEEN: process.env.AUTO_STATUS_SEEN !== undefined ? process.env.AUTO_STATUS_SEEN === 'true' : true, 
  AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY !== undefined ? process.env.AUTO_STATUS_REPLY === 'true' : true,
  STATUS_READ_MSG: process.env.STATUS_READ_MSG || '',
  AUTO_DL: process.env.AUTO_DL !== undefined ? process.env.AUTO_DL === 'true' : false,
  AUTO_READ: process.env.AUTO_READ !== undefined ? process.env.AUTO_READ === 'true' : false,
  AUTO_TYPING: process.env.AUTO_TYPING !== undefined ? process.env.AUTO_TYPING === 'true' : false,
  AUTO_RECORDING: process.env.AUTO_RECORDING !== undefined ? process.env.AUTO_RECORDING === 'true' : false,
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE !== undefined ? process.env.ALWAYS_ONLINE === 'true' : false,
  AUTO_REACT: process.env.AUTO_REACT !== undefined ? process.env.AUTO_REACT === 'true' : false,
  AUTO_BLOCK: process.env.AUTO_BLOCK !== undefined ? process.env.AUTO_BLOCK === 'true' : true,
  REJECT_CALL: process.env.REJECT_CALL !== undefined ? process.env.REJECT_CALL === 'true' : false, 
  NOT_ALLOW: process.env.NOT_ALLOW !== undefined ? process.env.NOT_ALLOW === 'true' : true,
  MODE: process.env.MODE || "public",
  OWNER_NAME: process.env.OWNER_NAME || "BRUCE BERA",
  OWNER_NUMBER: process.env.OWNER_NUMBER || "254743982206",
  GEMINI_KEY: process.env.GEMINI_KEY || "AIzaSyCUPaxfIdZawsKZKqCqJcC-GWiQPCXKTDc",
  WELCOME: process.env.WELCOME !== undefined ? process.env.WELCOME === 'true' : false, 

  // Auto Bio Feature
  AUTO_BIO: process.env.AUTO_BIO !== undefined ? process.env.AUTO_BIO === 'true' : true,
  BIO_TEXTS: [
    "💔 Legends never die | {time}",
    "🌧️ I still see your shadows in my room | {time}",
    "🔥 I cannot change you, so I must replace you | {time}",
    "🌪️ Wishing well of lost souls | {time}",
    "🌟 pain is part of progress | {time}",
    "🎤 We ain't making it past 21 | {time}",
    "💭 Thinking too much, my mind is a maze | {time}",
    "🚀 Blast off to another galaxy | {time}"
  ],

  // Anti Left Feature
  ANTI_LEFT: process.env.ANTI_LEFT !== undefined ? process.env.ANTI_LEFT === 'true' : true,
  ANTI_LEFT_MSG: process.env.ANTI_LEFT_MSG || "🚨 You cannot leave this group! You've been added back automatically."
};

module.exports = config;
