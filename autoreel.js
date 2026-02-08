const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { exec } = require("child_process");

// auto ffmpeg detect (termux / linux / replit)
const FFMPEG = "ffmpeg";

function pickRandomFile(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".mp3"));
  if (!files.length) return null;
  return path.join(dir, files[Math.floor(Math.random() * files.length)]);
}

function getAudioDuration(filePath) {
  return new Promise((resolve, reject) => {
    exec(
      `${FFMPEG} -i "${filePath}" 2>&1`,
      (err, stdout) => {
        const match = stdout.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
        if (!match) return reject("Duration not found");
        const sec =
          parseInt(match[1]) * 3600 +
          parseInt(match[2]) * 60 +
          parseFloat(match[3]);
        resolve(sec);
      }
    );
  });
}

module.exports = {
  config: {
    name: "autoreel",
    aliases: ["reel", "ar"],
    role: 0,
    author: "Shourov",
    description: "Auto reel from photo with song (auto duration)",
    category: "media",
    countDown: 5
  },

  onStart: async ({ api, event, args }) => {
    try {
      const style = (args[0] || "love").toLowerCase();
      const baseDir = path.join(process.cwd(), "public", style);

      if (!fs.existsSync(baseDir)) {
        return api.sendMessage(
          "❌ Style not found\nUse: sad / love / cinematic",
          event.threadID
        );
      }

      if (!event.messageReply || !event.messageReply.attachments?.[0]) {
        return api.sendMessage(
          "📸 Reply to an image\nExample: reply + autoreel love",
          event.threadID
        );
      }

      const audioPath = pickRandomFile(baseDir);
      if (!audioPath) {
        return api.sendMessage("❌ No audio found", event.threadID);
      }

      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const imgPath = path.join(tmpDir, `${event.senderID}.jpg`);
      const outPath = path.join(tmpDir, `${event.senderID}.mp4`);

      // download image
      const imgUrl = event.messageReply.attachments[0].url;
      const img = await axios.get(imgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, img.data);

      const duration = await getAudioDuration(audioPath);

      api.sendMessage("🎬 Creating reel… please wait", event.threadID);

      const cmd = `
${FFMPEG} -y -loop 1 -i "${imgPath}" -i "${audioPath}" \
-filter_complex "
scale=720:1280,
zoompan=z='min(zoom+0.0015,1.15)':d=125,
drawtext=text='${event.senderID}':fontcolor=white:fontsize=24:x=(w-text_w)/2:y=h-60,
fade=t=in:st=0:d=1,
fade=t=out:st=${Math.max(duration - 1, 1)}:d=1
" \
-t ${duration} -pix_fmt yuv420p -shortest "${outPath}"
      `;

      exec(cmd, async (err) => {
        if (err) {
          console.log(err);
          return api.sendMessage("❌ Reel creation failed", event.threadID);
        }

        await api.sendMessage(
          {
            body: "✨ Auto reel ready!",
            attachment: fs.createReadStream(outPath)
          },
          event.threadID
        );

        // cleanup
        [imgPath, outPath].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
      });

    } catch (e) {
      console.log(e);
      api.sendMessage("❌ Something went wrong", event.threadID);
    }
  }
};