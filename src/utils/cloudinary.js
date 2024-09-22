import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_CLOUDSECRET
});


const uploadOnCloudinary = async(localFilePatch) => {
    try {
        if (!localFilePatch) return null

        const response = await cloudinary.uploader.upload(localFilePatch, {
            resource_type: 'auto'
        })

        console.log("file is uploaded on cloudinary",
            response.url
        );
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePatch)
        return null;
    }
}

export { uploadOnCloudinary }