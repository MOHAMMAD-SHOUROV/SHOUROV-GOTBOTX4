const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage, registerFont } = require("canvas");

// ✅ Register Bangla font
registerFont(
  path.join(__dirname, "fonts/NotoSansBengali-Bold.ttf"),
  { family: "BanglaFont" }
);

module.exports = {
  config: {
    name: "board",
    aliases: ["back"],
    version: "1.1",
    author: "alihsan Shourov",
    role: 0,
    shortDescription: "Write name/text on board",
    longDescription: "A person holding a white board with Bangla/English text",
    category: "fun",
    guide: "/board <text>"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const text = args.join(" ");
      if (!text) {
        return api.sendMessage(
          "❌ লেখা দিন\nExample: /board সৌরভ",
          event.threadID,
          event.messageID
        );
      }

      const canvas = createCanvas(800, 800);
      const ctx = canvas.getContext("2d");

      // Background image
      const bg = await loadImage("https://files.catbox.moe/mspgp7.png");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Text style (Bangla supported)
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 46px BanglaFont";

      // ✅ Board text area (nicher দিকে নামানো)
      const maxWidth = 520;
      const startY = 470; // ← আগের চেয়ে নিচে
      const lineHeight = 55;

      wrapText(ctx, text, canvas.width / 2, startY, maxWidth, lineHeight);

      const outPath = path.join(__dirname, "board_output.png");
      fs.writeFileSync(outPath, canvas.toBuffer("image/png"));

      await api.sendMessage(
        {
          body: "🪧 বোর্ড তৈরি করা হয়েছে",
          attachment: fs.createReadStream(outPath)
        },
        event.threadID,
        () => fs.unlinkSync(outPath)
      );

    } catch (err) {
      console.error(err);
      api.sendMessage(
        "❌ বোর্ড তৈরি করতে সমস্যা হয়েছে",
        event.threadID
      );
    }
  }
};

// 🔹 Auto text wrap function
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}