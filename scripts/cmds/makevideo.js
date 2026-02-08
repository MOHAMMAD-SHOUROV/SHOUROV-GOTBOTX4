const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { exec } = require("child_process");

module.exports = {
  config: {
    name: "makevideo",
    aliases: ["mv", "picvideo"],
    role: 0,
    author: "Shourov",
    description: "Make video from photo with trending song",
    category: "media",
    countDown: 10
  },

  onStart: async ({ api, event, args }) => {
    try {
      // duration
      const duration = parseInt(args[0]) || 20;
      if (![10, 20, 30].includes(duration)) {
        return api.sendMessage(
          "❌ Duration must be 10 / 20 / 30 seconds\nExample: makevideo 20",
          event.threadID,
          event.messageID
        );
      }

      // check reply image
      if (!event.messageReply || !event.messageReply.attachments[0]) {
        return api.sendMessage(
          "📸 Reply to an image to make video\nExample: reply + makevideo 20",
          event.threadID,
          event.messageID
        );
      }

      const imgUrl = event.messageReply.attachments[0].url;

      const tmp = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);

      const imgPath = path.join(tmp, `img_${event.senderID}.jpg`);
      const audioPath = path.join(tmp, `audio_${event.senderID}.mp3`);
      const outPath = path.join(tmp, `video_${event.senderID}.mp4`);

      // trending song (change anytime)
      const songUrl =
        "https://files.catbox.moe/2dqwbl.mp4"; // trending audio/video source

      // download image
      const img = await axios.get(imgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, img.data);

      // download audio
      const song = await axios.get(songUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(audioPath, song.data);

      api.sendMessage("🎬 Creating video... please wait", event.threadID);

      // ffmpeg command (zoom + fade + beat effect)
      const cmd = `
ffmpeg -y -loop 1 -i "${imgPath}" -i "${audioPath}" \
-filter_complex "
scale=720:1280,
zoompan=z='min(zoom+0.0015,1.2)':d=125,
fade=t=in:st=0:d=1,
fade=t=out:st=${duration - 1}:d=1
" \
-t ${duration} -pix_fmt yuv420p -shortest "${outPath}"
      `;

      exec(cmd, async (err) => {
        if (err) {
          console.log(err);
          return api.sendMessage("❌ Video creation failed", event.threadID);
        }

        await api.sendMessage(
          {
            body: "✨ Your video is ready!",
            attachment: fs.createReadStream(outPath)
          },
          event.threadID
        );

        // cleanup
        [imgPath, audioPath, outPath].forEach(f => {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        });
      });

    } catch (e) {
      console.log(e);
      api.sendMessage("❌ Something went wrong", event.threadID);
    }
  }
};