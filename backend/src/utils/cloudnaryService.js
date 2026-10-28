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

const cloudinaryUpload = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error("No file path provided");

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "my-app",
            timeout: 120000
        });

        safeUnlink(localFilePath);
        return response;
    } catch (error) {
        console.error("Cloudinary upload failed:", error?.message || error);
        safeUnlink(localFilePath);
        return null;
    }
};

export { cloudinaryUpload };