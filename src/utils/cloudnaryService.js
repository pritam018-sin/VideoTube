import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryUpload = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error("No file path provided");

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            // folder: "your_folder_name"
        })
        //file has been uploaded successfully
        console.log("File uploaded successfully:" , response.url); 
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //removed the locally saved temporay file as the upload got failed
        return null
    }
}

export {cloudinaryUpload };