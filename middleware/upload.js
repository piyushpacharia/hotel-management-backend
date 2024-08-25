import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the uploads directory exists

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use absolute path for the destination directory
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate a unique filename with the current timestamp and original file extension
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 },
    fileFilter: function (req, file, cb) {

        // Allowed file types
        const fileTypes = /jpeg|jpg|png/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            cb(null, true);
        } else {
            cb(new Error('Error: Images Only!'));
        }
    }
});
