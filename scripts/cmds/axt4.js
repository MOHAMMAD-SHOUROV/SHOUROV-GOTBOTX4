const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sm4",
    version: "3.0",
    role: 0,
    author: "alihsan Shourov",
    description: "Royal VIP premium animated profile (GIF)",
    category: "fun",
    countDown: 5
  },

  onStart: async ({ api, event, args }) => {
    const name = args.join(" ");
    if (!name) {
      return api.sendMessage(
        "❌ Usage:\nsm4 YourName",
        event.threadID,
        event.messageID
      );
    }

    const width = 720;
    const height = 420;

    const encoder = new GIFEncoder(width, height);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    const outPath = path.join(__dirname, "sm4_royal.gif");
    encoder.createWriteStream().pipe(fs.createWriteStream(outPath));

    encoder.start();
    encoder.setRepeat(0);      // infinite loop
    encoder.setDelay(110);    // smooth animation
    encoder.setQuality(10);

    // 🎞️ Animation frames
    for (let i = 0; i < 28; i++) {
      ctx.clearRect(0, 0, width, height);

      // 🌑 Royal dark gradient background
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(1, "#020617");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // ✨ Golden shimmer line
      ctx.fillStyle = "rgba(255,215,0,0.15)";
      ctx.fillRect(0, (i * 12) % height, width, 6);

      // 👑 Glow effect
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(255,215,0,0.9)";
      ctx.shadowBlur = 18 + (i % 6) * 2;

      ctx.font = "bold 44px Arial";
      ctx.fillStyle = "#FFD700";
      ctx.fillText("👑 ROYAL VIP 👑", width / 2, 85);

      ctx.shadowBlur = 12;
      ctx.font = "bold 52px Arial";
      ctx.fillStyle = "#fff7cc";
      ctx.fillText(name, width / 2, 165);

      ctx.shadowBlur = 0;

      ctx.font = "22px Arial";
      ctx.fillStyle = "#facc15";
      ctx.fillText("STATUS : PREMIUM ELITE", width / 2, 215);

      ctx.fillStyle = "#fde68a";
      ctx.fillText("ACCESS : VIP ONLY", width / 2, 250);

      ctx.font = "18px monospace";
      ctx.fillStyle = "#FFD700";
      ctx.fillText(">> Initializing royal protocol...", width / 2, 305);

      // 🔶 Blinking diamond cursor
      ctx.fillStyle = i % 2 === 0 ? "#FFD700" : "#020617";
      ctx.fillRect(width / 2 + 210, 150, 12, 18);

      encoder.addFrame(ctx);
    }

    encoder.finish();

    await api.sendMessage(
      {
        body: "✨ ROYAL VIP PROFILE ACTIVATED ✨",
        attachment: fs.createReadStream(outPath)
      },
      event.threadID,
      () => fs.unlinkSync(outPath),
      event.messageID
    );
  }
};