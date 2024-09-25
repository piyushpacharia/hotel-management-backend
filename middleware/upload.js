
import cryptoRandomString from "crypto-random-string";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";

/*-------------------Image Upload via Multer---------------------------*/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
   
    const uploadPaths = {
      documentThumbnail: 'uploads/documentThumbnail',
      profileThumbnail: 'uploads/profileThumbnail',
      expenseThumbnail: 'uploads/expenseThumbnail',
      employeeThumbnail: 'uploads/employeeThumbnail',
      employeeDocument: 'uploads/employeeDocument',

    };

    const uploadPath = uploadPaths[file.fieldname] || path.join('uploads', req.params.fileCategory);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = cryptoRandomString({ length: 10, type: 'alphanumeric' });
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileExtensionFilter = (req, file, cb) => {
  const allowedMimetypes = [
    "application/pdf", "video/mp4", "audio/mpeg",
    "image/png", "image/jpeg", "image/jpg", "image/webp"
  ];

  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, MP3, JPG, PNG, JPEG, and WebP files are allowed!"), false);
  }
};

const imgUpload = multer({
  storage,
  fileFilter: fileExtensionFilter,
  limits: { fileSize: 1024 * 1024 * 10 },
});

// Image compression function
// const compressImage = async (file, quality = 80) => {
//   try {
//     const { path: filePath, filename } = file;
//     const outputPath = path.join(path.dirname(filePath), `compressed_${filename}`);

//     await sharp(filePath)
//       .webp({ quality }) // Convert to WebP format
//       .toFile(outputPath);

//     // Delete the original file with a slight delay
//     setTimeout(async () => {
//       try {
//         await fs.unlink(filePath);
//         await fs.rename(outputPath, filePath);
//       } catch (unlinkError) {
//         console.error('Error deleting original file:', unlinkError);
//       }
//     }, 500); // 500ms delay

//   } catch (error) {
//     console.error('Error compressing image:', error);
//   }
// };



export const uploadFile = (req, res, next) => {

 
  const upload = imgUpload.fields([
    { name: "documentThumbnail", maxCount: 10 },
    { name: "profileThumbnail", maxCount: 1 },
    { name: "expenseThumbnail", maxCount: 1},
    { name: "employeeThumbnail", maxCount: 1},
    { name: "employeeDocument", maxCount: 10},


  ]);


  upload(req, res, async (err) => {
    if (err) return next(err);

    const imageFields = [
      'documentThumbnail', 'profileThumbnail', 'expenseThumbnail','employeeThumbnail','employeeDocument',
    ];

    // if (req.files) {
    //   for (const field of imageFields) {
    //     const files = req.files[field];
    //     if (files) {
    //       for (const file of Array.isArray(files) ? files : [files]) {
    //         if (file.mimetype.startsWith('image/')) {
    //           await compressImage(file);
    //         }
    //       }
    //     }
    //   }
    // }
    next();
  });
};



