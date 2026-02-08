const { createCanvas, registerFont } = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sm2",
    version: "3.0",
    role: 0,
    author: "alihsan Shourov",
    description: "Romantic animated glow text (GIF)",
    category: "fun",
    countDown: 5
  },

  onStart: async ({ api, event, args }) => {
    const text = args.join(" ");
    if (!text) {
      return api.sendMessage(
        "❌ Usage:\nsm2 YourName",
        event.threadID,
        event.messageID
      );
    }

    const width = 600;
    const height = 300;

    const encoder = new GIFEncoder(width, height);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const outPath = path.join(__dirname, "sm2_animated.gif");
    const stream = encoder.createWriteStream();
    stream.pipe(fs.createWriteStream(outPath));

    encoder.start();
    encoder.setRepeat(0);   // loop forever
    encoder.setDelay(120);  // frame speed
    encoder.setQuality(10);

    // 🔮 Animation frames
    for (let i = 0; i <= 20; i++) {
      ctx.clearRect(0, 0, width, height);

      // background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#1a002a");
      gradient.addColorStop(1, "#2d0036");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // glow effect
      ctx.shadowColor = "rgba(255,105,180,0.8)";
      ctx.shadowBlur = i * 2;

      ctx.font = "bold 42px Arial";
      ctx.fillStyle = `rgba(255,182,193,${i / 20})`;
      ctx.textAlign = "center";

      ctx.fillText("💖 Romantic Glow 💖", width / 2, 100);
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, width / 2, 170);

      ctx.font = "22px Arial";
      ctx.fillStyle = "#ffb6c1";
      ctx.fillText("Soft • Pure • Elegant", width / 2, 220);

      encoder.addFrame(ctx);
    }

    encoder.finish();

    await api.sendMessage(
      {
        body: "💞 Romantic animated glow just for you",
        attachment: fs.createReadStream(outPath)
      },
      event.threadID,
      () => fs.unlinkSync(outPath),
      event.messageID
    );
  }
};