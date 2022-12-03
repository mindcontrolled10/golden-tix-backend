const multer = require("multer");
const path = require("path");

const memory = multer.memoryStorage();
const multerOption = {
  memory,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const allowedExt = /png|jpg|jpeg|webp/;
    if (!allowedExt.test(ext)) return cb(new Error("invalid Data Type"), false);
    cb(null, true);
  },
  limits: { fileSize: 1 * 1024 * 1024 },
};

const uploadFile = (req, res, next) => {
  const upload = multer(multerOption).single("image");
  upload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      console.log(error);
      return res.status(400).json({
        status: 400,
        msg: "File too large, image must be 2MB or lower",
      });
    } else if (error) {
      console.log(error);
      return res.status(415).json({ status: 415, msg: error.message });
    }
    next();
  });
};

module.exports = uploadFile;
