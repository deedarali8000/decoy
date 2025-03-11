
import { promises as _0x217571 } from 'fs';
import _0x42a47d from 'path';
import _0x44bfe2 from 'node-fetch';
import _0xc11ef3 from '../../config.cjs';
const __filename = new URL(import.meta.url).pathname;
const __dirname = _0x42a47d.dirname(__filename);
const chatHistoryFile = _0x42a47d.resolve(__dirname, "../gpt_history.json");
async function readChatHistoryFromFile() {
  try {
    const _0xcec0a1 = await _0x217571.readFile(chatHistoryFile, "utf-8");
    return JSON.parse(_0xcec0a1);
  } catch {
    return {};
  }
}
async function writeChatHistoryToFile(_0xa27bc2) {
  try {
    await _0x217571.writeFile(chatHistoryFile, JSON.stringify(_0xa27bc2, null, 0x2));
  } catch (_0x271308) {
    console.error("Error writing chat history:", _0x271308);
  }
}
async function deleteChatHistory(_0x24396b, _0x4bc13d) {
  try {
    delete _0x24396b[_0x4bc13d];
    await writeChatHistoryToFile(_0x24396b);
  } catch (_0x1b5308) {
    console.error("Error deleting chat history:", _0x1b5308);
  }
}
async function updateChatHistory(_0x2fc7df, _0x189bd8, _0x4009b3) {
  try {
    if (!_0x2fc7df[_0x189bd8]) {
      _0x2fc7df[_0x189bd8] = [];
    }
    _0x2fc7df[_0x189bd8].push(_0x4009b3);
    if (_0x2fc7df[_0x189bd8].length > 0x14) {
      _0x2fc7df[_0x189bd8].shift();
    }
    await writeChatHistoryToFile(_0x2fc7df);
  } catch (_0x404a38) {
    console.error("Error updating chat history:", _0x404a38);
  }
}
const mistral = async (_0x17ae20, _0x4cce27) => {
  const _0x426c73 = await readChatHistoryFromFile();
  const _0x4869c6 = _0x17ae20.body.trim();
  if (_0x4869c6 === '/forget') {
    try {
      await deleteChatHistory(_0x426c73, _0x17ae20.sender);
      await _0x4cce27.sendMessage(_0x17ae20.from, {
        'text': "Chat history deleted successfully."
      }, {
        'quoted': _0x17ae20
      });
    } catch (_0x14fa8b) {
      console.error("Error deleting chat history:", _0x14fa8b);
      await _0x4cce27.sendMessage(_0x17ae20.from, {
        'text': "Failed to delete chat history. Please try again later."
      }, {
        'quoted': _0x17ae20
      });
    }
    return;
  }
  const _0x3614ee = _0xc11ef3.PREFIX;
  if (!_0x4869c6.startsWith(_0x3614ee)) {
    return;
  }
  const _0x2792bc = _0x4869c6.slice(_0x3614ee.length).split(" ")[0x0].toLowerCase();
  const _0x25eaf0 = _0x4869c6.slice(_0x3614ee.length + _0x2792bc.length).trim();
  const _0x155b31 = ['gpt', "bot", 'ai'];
  if (!_0x155b31.includes(_0x2792bc)) {
    return;
  }
  if (!_0x25eaf0) {
    await _0x4cce27.sendMessage(_0x17ae20.from, {
      'text': "*EXAMPLE: " + _0x3614ee + "gpt who is Elon Musk?*"
    }, {
      'quoted': _0x17ae20
    });
    return;
  }
  try {
    await _0x4cce27.sendMessage(_0x17ae20.from, {
      'text': "*AI GPT is processing your request please wait...*"
    }, {
      'quoted': _0x17ae20
    });
    const _0x54f8f3 = 'https://api.siputzx.my.id/api/ai/copilot?text=' + encodeURIComponent(_0x25eaf0);
    const _0x17cba5 = await _0x44bfe2(_0x54f8f3);
    if (!_0x17cba5.ok) {
      const _0x230e83 = await _0x17cba5.text();
      throw new Error("API returned status " + _0x17cba5.status + ": " + _0x230e83);
    }
    const _0x342b3f = await _0x17cba5.json();
    const _0x410915 = _0x342b3f?.["data"];
    if (!_0x410915) {
      throw new Error("Invalid API response structure");
    }
    await updateChatHistory(_0x426c73, _0x17ae20.sender, {
      'role': "user",
      'content': _0x25eaf0
    });
    await updateChatHistory(_0x426c73, _0x17ae20.sender, {
      'role': 'assistant',
      'content': _0x410915
    });
    const _0x444a59 = _0x17ae20.pushName || 'User';
    const _0x2bb6c2 = "Here's your response, " + _0x444a59 + ":\n\n" + _0x410915;
    await _0x4cce27.sendMessage(_0x17ae20.from, {
      'text': _0x2bb6c2
    }, {
      'quoted': _0x17ae20
    });
  } catch (_0x3cf355) {
    console.error("Error:", _0x3cf355);
    const _0x24e54c = _0x3cf355.message.includes("API") ? "The AI service is currently unavailable. Please try again later." : "Something went wrong. Please try again later.";
    await _0x4cce27.sendMessage(_0x17ae20.from, {
      'text': _0x24e54c
    }, {
      'quoted': _0x17ae20
    });
  }
};
export default mistral;