module.exports = {
  config: {
    name: "axt4",
    version: "2.0",
    role: 0,
    author: "alihsan Shourov",
    description: "Royal VIP premium animated style",
    category: "fun",
    countDown: 5
  },

  onStart: async ({ api, event, args }) => {
    try {
      const name = args.join(" ");
      if (!name) {
        return api.sendMessage(
          "❌ Usage:\sm4 shourov",
          event.threadID,
          event.messageID
        );
      }

      const msg = `
╔══════════════════════╗
        👑✨ 𝗥𝗢𝗬𝗔𝗟 𝗩𝗜𝗣 ✨👑
╚══════════════════════╝

🤴 𝗡𝗔𝗠𝗘
━━━━━━━━━━━━━━
💎 ${name}

🏆 𝗦𝗧𝗔𝗧𝗨𝗦
━━━━━━━━━━━━━━
🌟 Rank      : PREMIUM
💼 Class     : ELITE
🔥 Power     : UNLIMITED
👑 Access    : VIP ONLY

✨ Aura : Royal • Classy • Untouchable
`;

      await api.sendMessage(
        {
          body: msg,
          attachment: await global.utils.getStreamFromURL(
            "https://media.giphy.com/media/l0MYC0LajbaPoEADu/giphy.gif"
          )
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.log("sm4 ERROR:", err);
      api.sendMessage("❌ Something went wrong", event.threadID);
    }
  }
};