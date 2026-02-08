module.exports = {
  config: {
    name: "axt2",
    role: 0,
    description: "Romantic glow text gif"
  },

  onStart: async ({ api, event, args }) => {
    const name = args.join(" ");
    if (!name) {
      return api.sendMessage("❌ Please give a name\nExample: axt2 Shourov", event.threadID);
    }

    const msg =
`💖✨ 𝑹𝒐𝒎𝒂𝒏𝒕𝒊𝒄 𝑮𝒍𝒐𝒘 ✨💖

🌸 Name: ${name}

🌷 You shine differently
🌙 Soft like moonlight
💫 Pure & elegant`;

    api.sendMessage(
      {
        body: msg,
        attachment: await global.utils.getStreamFromURL(
          "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif"
        )
      },
      event.threadID
    );
  }
};