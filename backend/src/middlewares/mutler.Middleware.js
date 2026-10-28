import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";

// Dynamically determine and ensure upload directory exists
const getTempDir = () => {
    // Try current working directory first, whether repo root or backend folder
    const candidates = [
        path.resolve(process.cwd(), "public/temp"),
        path.resolve(process.cwd(), "backend/public/temp"),
        path.resolve(os.tmpdir(), "videotube-temp")
    ];

    for (const dir of candidates) {
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            return dir;
        } catch (e) {
            // try next candidate
        }
    }
    return os.tmpdir();
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, getTempDir());
    },
    filename: function (req, file, cb) {
        const cleanName = (file.originalname || "upload").replace(/[^a-zA-Z0-9.-]/g, "_");
        cb(null, `${Date.now()}-${cleanName}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit for long/HD videos
    }
});

export { upload };