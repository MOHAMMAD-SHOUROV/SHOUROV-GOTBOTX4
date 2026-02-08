const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "board",
    aliases: ["back"],
    version: "1.0",
    author: "alihsan Shourov",
    role: 0,
    shortDescription: "Write name on board",
    longDescription: "A person holding a white board with custom text",
    category: "fun",
    guide: "/board <text>"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const text = args.join(" ");
      if (!text) {
        return api.sendMessage(
          "❌ Please give a name or text.\nExample: /board Shourov",
          event.threadID,
          event.messageID
        );
      }

      const canvas = createCanvas(800, 800);
      const ctx = canvas.getContext("2d");

      // background image (person holding board)
      const bg = await loadImage(
        "https://files.catbox.moe/mspgp7.png"
      ); 
      // ↑ এটা free stock image, board visible

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // board text style
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // board position (adjustable)
      ctx.fillText(text, canvas.width / 2, 420);

      // save file
      const outPath = path.join(__dirname, "board_output.png");
      fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

      await api.sendMessage(
        {
          body: "🪧 Your board is ready!",
          attachment: fs.createReadStream(outPath)
        },
        event.threadID,
        () => fs.unlinkSync(outPath)
      );

    } catch (err) {
      console.error(err);
      api.sendMessage(
        "❌ Something went wrong while creating the board image.",
        event.threadID
      );
    }
  }
};