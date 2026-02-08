module.exports = {
  config: {
    name: "sm3",
    role: 0,
    description: "Neon hacker style gif"
  },

  onStart: async ({ api, event, args }) => {
    const name = args.join(" ");
    if (!name) {
      return api.sendMessage("❌ Usage: sm3 Shourov", event.threadID);
    }

    const msg =
`⚡🔥 𝙉𝙀𝙊𝙉 𝙈𝙊𝘿𝙀 🔥⚡

👾 USER: ${name}
🧠 STATUS: ACTIVE
💻 MODE: HACKER

⚠️ Access Granted`;

    api.sendMessage(
      {
        body: msg,
        attachment: await global.utils.getStreamFromURL(
          "https://media.giphy.com/media/3o7TKz9bK0Nw3yqkKI/giphy.gif"
        )
      },
      event.threadID
    );
  }
};