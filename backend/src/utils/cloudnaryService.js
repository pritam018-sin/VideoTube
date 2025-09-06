import {v2 as cloudinary} from "cloudinary";
import fs from "fs";   
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryUpload = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error("No file path provided");
        console.log("Uploading file to Cloudinary:", localFilePath);

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "my-app",
        })
    
        
        //file has been uploaded successfully
        // console.log("File uploaded successfully:" , response.url); 
        fs.unlinkSync(localFilePath); //remove the locally saved temporary file
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //removed the locally saved temporay file as the upload got failed
        return null
    }
}

export {cloudinaryUpload };