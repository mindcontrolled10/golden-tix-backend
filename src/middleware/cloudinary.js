const cloudinary = require("../config/cloudinary");
const dataUriParser = require("datauri/parser");
const path = require("path");

const uploaderCloudinary = async (req, res, next) => {
  const { file } = req;
  if (!file) return next();

  const parser = new dataUriParser();
  const buffer = file.buffer;
  const ext = path.extname(file.originalname).toString();
  const datauri = parser.format(ext, buffer);
  const clodinaryOpt = {
    public_id: `${Math.floor(Math.random() * 10e9)}`,
    folder: "Golden-tix",
  };
  try {
    const result = await cloudinary.uploader.upload(
      datauri.content,
      clodinaryOpt
    );
    req.file = `${result.public_id}.${result.format}`;
    console.log(req.file);
    next();
  } catch (error) {
    console.log(error);
    return res.status(415).json({ status: 415, msg: error.message });
  }
};

module.exports = uploaderCloudinary;
