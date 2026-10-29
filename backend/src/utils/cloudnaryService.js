import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const safeUnlink = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error("Error removing local file:", err?.message);
    }
};

const isVideoFile = (filePath) => {
    return /\.(mp4|mkv|mov|avi|wmv|flv|webm|m4v)$/i.test(filePath);
};

const uploadLargePromise = (filePath, options) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(filePath, options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
};

const cloudinaryUpload = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        const isVideo = isVideoFile(localFilePath);
        let fileSize = 0;
        try {
            if (fs.existsSync(localFilePath)) {
                fileSize = fs.statSync(localFilePath).size;
            }
        } catch (e) {
            // Ignore stat errors
        }

        let response;

        if (isVideo) {
            // For videos <= 95MB, use direct upload (fast, reliable, directly returns video duration)
            if (fileSize > 0 && fileSize <= 95 * 1024 * 1024) {
                try {
                    response = await cloudinary.uploader.upload(localFilePath, {
                        resource_type: "video",
                        folder: "my-app",
                        timeout: 300000 // 5 minutes
                    });
                } catch (directErr) {
                    console.warn("Direct video upload failed, trying chunked upload_large:", directErr?.message);
                    response = await uploadLargePromise(localFilePath, {
                        resource_type: "video",
                        folder: "my-app",
                        chunk_size: 6000000,
                        timeout: 600000
                    });
                }
            } else {
                // For videos > 95MB, use chunked upload_large with Promise wrapper
                try {
                    response = await uploadLargePromise(localFilePath, {
                        resource_type: "video",
                        folder: "my-app",
                        chunk_size: 6000000, // 6MB chunks
                        timeout: 600000 // 10 minutes
                    });
                } catch (largeErr) {
                    console.warn("Chunked upload_large failed, trying standard upload fallback:", largeErr?.message);
                    response = await cloudinary.uploader.upload(localFilePath, {
                        resource_type: "video",
                        folder: "my-app",
                        timeout: 300000
                    });
                }
            }
        } else {
            // Images / Thumbnails / Avatars / Documents
            response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                folder: "my-app",
                timeout: 120000
            });
        }

        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error?.message || error);
        return null;
    } finally {
        safeUnlink(localFilePath);
    }
};

export { cloudinaryUpload };