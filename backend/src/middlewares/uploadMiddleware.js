const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: "dsuldmwjo",
  api_key: "838299438476241",
  api_secret: "dD5b8UxE3tCC6HjJWsgW_iORDCE",
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "TechZone/Products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage: storage });
module.exports = upload;
