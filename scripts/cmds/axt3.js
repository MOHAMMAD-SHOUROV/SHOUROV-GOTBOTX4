module.exports = {
  config: {
    name: "sm3",
    version: "2.0",
    role: 0,
    author: "alihsan Shourov",
    description: "Ultra neon hacker style profile gif",
    category: "fun",
    countDown: 5
  },

  onStart: async ({ api, event, args }) => {
    try {
      const name = args.join(" ");
      if (!name) {
        return api.sendMessage(
          "❌ Usage:\nsm3 YourName",
          event.threadID,
          event.messageID
        );
      }

      const msg = `
╔══════════════════════╗
   ⚡🔥 𝗡𝗘𝗢𝗡 𝗛𝗔𝗖𝗞𝗘𝗥 𝗠𝗢𝗗𝗘 🔥⚡
╚══════════════════════╝

👾 𝗨𝗦𝗘𝗥 𝗜𝗗𝗘𝗡𝗧𝗜𝗧𝗬
━━━━━━━━━━━━━━
🔹 𝗡𝗔𝗠𝗘 : ${name}
🔹 𝗦𝗧𝗔𝗧𝗨𝗦 : 𝗔𝗖𝗧𝗜𝗩𝗘 🟢
🔹 𝗠𝗢𝗗𝗘 : 𝗡𝗘𝗢𝗡 𝗛𝗔𝗖𝗞𝗘𝗥
🔹 𝗟𝗘𝗩𝗘𝗟 : 𝗨𝗟𝗧𝗥𝗔

💻 𝗦𝗬𝗦𝗧𝗘𝗠 𝗔𝗖𝗖𝗘𝗦𝗦
━━━━━━━━━━━━━━
⚠️ 𝗔𝗰𝗰𝗲𝘀𝘀 𝗚𝗿𝗮𝗻𝘁𝗲𝗱
⚡ 𝗘𝗻𝗰𝗿𝘆𝗽𝘁𝗶𝗼𝗻 : 𝟭𝟬𝟬%
🧠 𝗔𝗜 𝗖𝗼𝗿𝗲 : 𝗢𝗡𝗟𝗜𝗡𝗘

⌛ Initializing neon protocol...
`;

      await api.sendMessage(
        {
          body: msg,
          attachment: await global.utils.getStreamFromURL(
            "https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif"
          )
        },
        event.threadID,
        event.messageID
      );

    } catch (err) {
      console.log("SM3 ERROR:", err);
      api.sendMessage("❌ Something went wrong", event.threadID);
    }
  }
};