module.exports = {
  config: {
    name: "sm2",
    version: "2.0",
    role: 0,
    author: "alihsan Shourov",
    description: "Romantic glow text with soft aesthetic gif",
    category: "fun",
    countDown: 5
  },

  onStart: async ({ api, event, args }) => {
    try {
      const name = args.join(" ");
      if (!name) {
        return api.sendMessage(
          "❌ Usage:\nsm2 YourName",
          event.threadID,
          event.messageID
        );
      }

      const msg = `
╔══════════════════════╗
      💖✨ 𝗥𝗢𝗠𝗔𝗡𝗧𝗜𝗖 𝗚𝗟𝗢𝗪 ✨💖
╚══════════════════════╝

🌸 𝗡𝗔𝗠𝗘
━━━━━━━━━━━━━━
💗 ${name}

🌷 𝗔𝗘𝗦𝗧𝗛𝗘𝗧𝗜𝗖 𝗩𝗜𝗕𝗘
━━━━━━━━━━━━━━
✨ You shine in silence
🌙 Soft like moonlight
💫 Pure, calm & elegant
🌹 A heart full of warmth

💞 Status: Loved & Cherished
`;

      await api.sendMessage(
        {
          body: msg,
          attachment: await global.utils.getStreamFromURL(
            "https://media.giphy.com/media/26BRrSvJUa0crqw4E/giphy.gif"
          )
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.log("SM2 ERROR:", err);
      api.sendMessage("❌ Something went wrong", event.threadID);
    }
  }
};