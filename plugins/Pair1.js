import axios from 'axios';

const PairCmd = async (m, Matrix) => {
  const args = m.body.trim().split(' ');

  if (args.length !== 2 || args[0].toLowerCase() !== 'pair1' || isNaN(args[1])) {
    return m.reply('*Please provide a valid number!*\nExample: *Pair1 254743982206*');
  }

  const number = args[1];
  const apiUrl = `https://projext-session-server-a9643bc1be6b.herokuapp.com/pair?number=${number}`;

  try {
    const { data } = await axios.get(apiUrl);
    if (!data || !data.pair_code) throw new Error('Invalid response from API');

    const replyMsg = `🔗 *Pairing Code Generated!*\n\n` +
                     `📌 *Number:* ${number}\n` +
                     `🔑 *Pair Code:* ${data.pair_code}\n\n` +
                     `✅ Use this code to complete the pairing process.`;

    await Matrix.sendMessage(m.from, { text: replyMsg }, { quoted: m });

  } catch (error) {
    console.error(error);
    await m.reply('*Failed to generate pair code! Please try again later.*');
  }
};

// Coded by Bera
export default PairCmd;
