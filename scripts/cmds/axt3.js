const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sm3",
    version: "3.0",
    role: 0,
    author: "alihsan Shourov",
    description: "Animated neon hacker profile (GIF)",
    category: "fun",
    countDown: 5
  },

  onStart: async ({ api, event, args }) => {
    const name = args.join(" ");
    if (!name) {
      return api.sendMessage(
        "❌ Usage:\nsm3 YourName",
        event.threadID,
        event.messageID
      );
    }

    const width = 700;
    const height = 380;

    const encoder = new GIFEncoder(width, height);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const outPath = path.join(__dirname, "sm3_neon.gif");
    encoder.createWriteStream().pipe(fs.createWriteStream(outPath));

    encoder.start();
    encoder.setRepeat(0);   // infinite loop
    encoder.setDelay(100); // animation speed
    encoder.setQuality(10);

    // 🎬 Animation frames
    for (let i = 0; i <= 24; i++) {
      ctx.clearRect(0, 0, width, height);

      // 🔲 background (dark cyber)
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, width, height);

      // 🟩 scanline effect
      ctx.fillStyle = "rgba(0,255,255,0.05)";
      ctx.fillRect(0, (i * 15) % height, width, 6);

      // ⚡ NEON GLOW
      ctx.shadowColor = "rgba(0,255,255,0.9)";
      ctx.shadowBlur = i * 2;

      ctx.textAlign = "center";

      ctx.font = "bold 42px Arial";
      ctx.fillStyle = "#00ffff";
      ctx.fillText("⚡ NEON HACKER MODE ⚡", width / 2, 80);

      ctx.font = "bold 48px Arial";
      ctx.fillStyle = "#22ff88";
      ctx.fillText(name, width / 2, 155);

      ctx.shadowBlur = 0;

      ctx.font = "22px Arial";
      ctx.fillStyle = "#7dd3fc";
      ctx.fillText("STATUS : ACTIVE", width / 2, 210);

      ctx.fillStyle = "#38bdf8";
      ctx.fillText("ACCESS : GRANTED", width / 2, 245);

      // 🔴 blinking cursor
      ctx.fillStyle = i % 2 === 0 ? "#00ff00" : "#020617";
      ctx.fillRect(width / 2 + 170, 140, 12, 28);

      ctx.font = "18px monospace";
      ctx.fillStyle = "#00ff00";
      ctx.fillText(">> Initializing cyber protocol...", width / 2, 300);

      encoder.addFrame(ctx);
    }

    encoder.finish();

    await api.sendMessage(
      {
        body: "👾 NEON HACKER PROFILE INITIALIZED",
        attachment: fs.createReadStream(outPath)
      },
      event.threadID,
      () => fs.unlinkSync(outPath),
      event.messageID
    );
  }
};