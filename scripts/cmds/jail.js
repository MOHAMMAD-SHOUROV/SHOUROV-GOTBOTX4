const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const request = require("request");

module.exports.config = {
  name: "jail",
  version: "8.1",
  author: "alihsan shourov",
  countDown: 10,
  role: 0,
  shortDescription: "Wanted with thin bars",
  category: "fun",
  guide: { en: "{pn} @tag OR reply" }
};

module.exports.onStart = async function ({ api, event, usersData }) {
  const { threadID, messageID } = event;

  let uid = null;
  let name = "Wanted";

  /* ===== TARGET RESOLVE (SAFE) ===== */
  if (event.messageReply?.senderID) {
    uid = event.messageReply.senderID;
  } else if (event.mentions && Object.keys(event.mentions).length > 0) {
    uid = Object.keys(event.mentions)[0];
  } else {
    uid = event.senderID;
  }

  try {
    name =
      ((await usersData.get?(uid))?.name || "Unknown User");

    /* ===== CACHE DIR ===== */
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

    const avatarCache = path.join(cacheDir, `wanted_avatar_${uid}.jpg`);
    const outputPath = path.join(cacheDir, `wanted_${Date.now()}.png`);

    const avatarURL = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500`;

    /* ===== DOWNLOAD AVATAR ===== */
    const downloadAvatar = () => {
      request(encodeURI(avatarURL))
        .pipe(fs.createWriteStream(avatarCache))
        .on("close", async () => {
          if (!fs.existsSync(avatarCache) || fs.statSync(avatarCache).size < 10000) {
            return useDefault();
          }
          await generate();
        })
        .on("error", useDefault);
    };

    const useDefault = () => {
      const fallback = "https://i.imgur.com/8Q2Z3tI.png";
      request(fallback)
        .pipe(fs.createWriteStream(avatarCache))
        .on("close", generate);
    };

    const generate = async () => {
      try {
        const finalPath = await generateThinBarsImage(avatarCache, name, outputPath);
        await api.sendMessage(
          {
            body: `🔒 ${name} is WANTED!\nLocked Up!`,
            mentions: [{ id: uid, tag: name }],
            attachment: fs.createReadStream(finalPath)
          },
          threadID,
          messageID
        );

        setTimeout(() => {
          [avatarCache, finalPath].forEach(f => {
            if (fs.existsSync(f)) fs.unlinkSync(f);
          });
        }, 10000);
      } catch (e) {
        api.sendMessage("⚠️ Failed to generate jail image.", threadID, messageID);
      }
    };

    downloadAvatar();
  } catch (err) {
    console.error("JAIL ERROR:", err);
    api.sendMessage("⚠️ Something went wrong!", threadID, messageID);
  }
};

/* ===== GRAPH / CANVAS LOGIC (UNCHANGED) ===== */
async function generateThinBarsImage(avatarPath, name, savePath) {
  const avatar = await loadImage(avatarPath);
  const width = 600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, width, height);

  ctx.font = "bold 100px Arial";
  ctx.fillStyle = "#ef4444";
  ctx.textAlign = "center";
  ctx.shadowColor = "#991b1b";
  ctx.shadowBlur = 20;
  ctx.fillText("WANTED", width / 2, 120);
  ctx.shadowColor = "transparent";

  const cx = width / 2;
  const cy = height / 2 + 20;
  const r = 200;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  ctx.globalAlpha = 0.8;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 20;
  ctx.lineCap = "round";

  const bars = 8;
  const spacing = width / (bars + 1);
  for (let i = 1; i <= bars; i++) {
    ctx.beginPath();
    ctx.moveTo(i * spacing, 180);
    ctx.lineTo(i * spacing, height - 180);
    ctx.stroke();
  }

  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(spacing, 260);
  ctx.lineTo(width - spacing, 260);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(spacing, height - 260);
  ctx.lineTo(width - spacing, height - 260);
  ctx.stroke();

  ctx.globalAlpha = 1;

  ctx.font = 'italic 50px "Segoe UI"';
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "#60a5fa";
  ctx.shadowBlur = 20;
  ctx.fillText("Locked Up!", width / 2, height - 100);
  ctx.shadowColor = "transparent";

  ctx.font = "bold 40px Arial";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText(name.toUpperCase(), width / 2, height - 50);

  fs.writeFileSync(savePath, canvas.toBuffer());
  return savePath;
}