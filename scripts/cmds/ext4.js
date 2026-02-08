module.exports = {
  config: {
    name: "axt4",
    role: 0,
    description: "Royal VIP animated style"
  },

  onStart: async ({ api, event, args }) => {
    const name = args.join(" ");
    if (!name) {
      return api.sendMessage("❌ Example: axt4 Shourov", event.threadID);
    }

    const msg =
`👑✨ 𝑹𝑶𝒀𝑨𝑳 𝑽𝑰𝑷 ✨👑

🤴 Name: ${name}

💎 Status: Elite
🏆 Rank: Premium
🌟 Power: Unlimited`;

    api.sendMessage(
      {
        body: msg,
        attachment: await global.utils.getStreamFromURL(
          "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif"
        )
      },
      event.threadID
    );
  }
};