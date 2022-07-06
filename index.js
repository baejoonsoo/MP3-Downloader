const router = require("express").Router();
const ytdl = require("ytdl-core");
const fs = require("fs");

const getFileName = (youtubeLink) => {
  if (youtubeLink.match(/^(https:\/\/(www.youtube.com|youtu.be))/)) {
    const reg = /(https:\/\/(www.youtube.com\/watch\?v=|youtu.be\/))|&.+/g;
    const fileName = youtubeLink.replace(reg, "");

    return {
      state: true,
      fileName: fileName,
    };
  }
  return {
    state: false,
    fileName: "error",
  };
};

router.post("/downloadmp3", async (req, res, next) => {
  try {
    const youtubeLink = req.query.youtubeLink;
    const { state, fileName } = getFileName(youtubeLink);

    if (!state) {
      res.status(400).json({ state: 400, message: "bad request" });
      return;
    }

    const wstream = await fs.createWriteStream(`./music/${fileName}.mp3`, {
      flags: "w",
    });
    ytdl(youtubeLink, {
      filter: "audioonly",
      quality: "highestaudio",
      highWaterMark: 1 << 25,
    }).pipe(
      await wstream.on("data", (data) => {
        wstream.write(data);
      })
    );

    res.status(200).json({ state: 200, message: "success" });
    return;
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;
