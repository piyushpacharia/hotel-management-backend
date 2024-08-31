import cryptoRandomString from "crypto-random-string";
import multer from "multer";
import path from "path";
import fs from "fs";

// Image Upload via Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const { fileCategory } = req.params;
    const uploadPath = fileCategory
      ? path.join("uploads", fileCategory.toLowerCase())
      : "uploads";

    // Ensure the directory exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    const uniqueName = cryptoRandomString({ length: 10, type: "alphanumeric" });
    const fileExtension = path.extname(file.originalname);
    cb(null, `${uniqueName}${fileExtension}`);
  },
});

const fileExtensionFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        "Only PDF, JPG, PNG, JPEG, and WEBP files are allowed!"
      )
    );
  }
};

const uploadFile = multer({
  storage,
  fileFilter: fileExtensionFilter,
  limits: { fileSize: 1024 * 1024 * 10 },
});

export default uploadFile;
