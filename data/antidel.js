




import { antiDeleteCommand, messageRevokeHandler } from "./plugins/antidelete.js";

Matrix.ev.on("messages.upsert", async chatUpdate => {
    await antiDeleteCommand(chatUpdate.messages[0], Matrix);
});

Matrix.ev.on("messages.delete", async chatUpdate => {
    await messageRevokeHandler(chatUpdate, Matrix);
});
