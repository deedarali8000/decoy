












     import { promises as fs } from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../config.cjs';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const chatHistoryFile = path.resolve(__dirname, '../mistral_history.json');

const mistralSystemPrompt = "You are a helpful AI assistant.";

async function readChatHistory() {
    try {
        const data = await fs.readFile(chatHistoryFile, "utf-8");
        return JSON.parse(data) || {};
    } catch (err) {
        console.error('Error reading chat history:', err);
        return {};
    }
}

async function writeChatHistory(chatHistory) {
    try {
        await fs.writeFile(chatHistoryFile, JSON.stringify(chatHistory, null, 2));
    } catch (err) {
        console.error('Error writing chat history:', err);
    }
}

async function updateChatHistory(chatHistory, sender, role, content) {
    if (!chatHistory[sender]) chatHistory[sender] = [];
    chatHistory[sender].push({ role, content });

    // Keep last 20 messages
    if (chatHistory[sender].length > 20) {
        chatHistory[sender] = chatHistory[sender].slice(-20);
    }

    await writeChatHistory(chatHistory);
}

async function deleteChatHistory(chatHistory, userId) {
    delete chatHistory[userId];
    await writeChatHistory(chatHistory);
}

async function sendAIResponse(m, Matrix, prompt, chatHistory) {
    try {
        const senderChatHistory = chatHistory[m.sender] || [];
        const messages = [
            { role: "system", content: mistralSystemPrompt },
            ...senderChatHistory,
            { role: "user", content: prompt }
        ];

        await m.React("⏳"); // React with hourglass emoji

        const response = await fetch('https://api.dreaded.site/api/chatgpt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: "text-generation",
                model: "hf/meta-llama/meta-llama-3-8b-instruct",
                messages: messages
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        const answer = responseData.result.response || "No response received.";

        await updateChatHistory(chatHistory, m.sender, "user", prompt);
        await updateChatHistory(chatHistory, m.sender, "assistant", answer);

        // If the response contains code, format it properly
        const codeMatch = answer.match(/```([\s\S]*?)```/);
        if (codeMatch) {
            const code = codeMatch[1];
            const msg = generateWAMessageFromContent(m.from, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: answer
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: "> *Regards, Bruce Bera*"
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({
                                title: "Code Snippet",
                                subtitle: "Copy this code easily",
                                hasMediaAttachment: false
                            }),
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons: [
                                    {
                                        name: "cta_copy",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "Copy Your Code",
                                            id: "copy_code",
                                            copy_code: code
                                        })
                                    }
                                ]
                            })
                        })
                    }
                }
            }, {});

            await Matrix.relayMessage(m.from, msg.message, { messageId: msg.key.id });
        } else {
            await Matrix.sendMessage(m.from, { text: answer }, { quoted: m });
        }

        await m.React("✅"); // Success reaction
    } catch (err) {
        console.error('AI Response Error:', err);
        await Matrix.sendMessage(m.from, { text: "Something went wrong. Please try again later." }, { quoted: m });
        await m.React("❌");
    }
}

const mistral = async (m, Matrix) => {
    const chatHistory = await readChatHistory();
    const text = m.body.trim().toLowerCase();

    if (text === "/forget") {
        await deleteChatHistory(chatHistory, m.sender);
        await Matrix.sendMessage(m.from, { text: 'Conversation history deleted successfully.' }, { quoted: m });
        return;
    }

    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const prompt = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['ai', 'gpt', 'bera'];

    if (validCommands.includes(cmd)) {
        if (!prompt) {
            await Matrix.sendMessage(m.from, { text: 'Please provide a prompt.' }, { quoted: m });
            return;
        }

        await sendAIResponse(m, Matrix, prompt, chatHistory);
    }
};

export default mistral;    



