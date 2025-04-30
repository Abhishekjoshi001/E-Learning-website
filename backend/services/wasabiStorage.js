import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import getSignedUrl from '@aws-sdk/s3-request-presigner';
import path from "path";
import crypto, { generateKey } from "crypto";
import wasabiConfig from "../middlewares/wasabiConfig";
import { buffer } from "stream/consumers";

const s3Client = new S3Client({                 //Connects your app to wasabi
    region: wasabiConfig.region,                // Initializes S3Client using wasabi config
    endpoint: wasabiConfig.endpoint,
    credentials: wasabiConfig.credentials,
});

generateKey: (originalFilename) => {
    const fileExtension = path.extname(originalFilename); //ex: "mp4"
    const randomString = crypto.randomBytes(8).toString('hex') //generates random string ex: "9f0a1b8c2d4e7f60"
    const timestamp = Date.now();
    return `videos/${timestamp}-${randomString}${fileExtension}`;
}

getUploadUrl: async (key, contentType, expiresIn = 3600) => {
    const command = new PutObjectCommand({
        Bucket: wasabiConfig.bucket,
        Key: key,
        ContentType: contentType,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
}
//It returns a pre-signed URL that can be used by the client (e.
// g., a browser or frontend app) to upload a file directly to 
// the bucket using an HTTP PUT request.

getStreamingUrl: async(key,expiresIn = 43200)=>{
    const command = new GetObjectCommand({
        Bucket: wasabiConfig.bucket,
        Key:key,
    });
    return getSignedUrl(s3Client,command,{expiresIn});
}

deleteFile: async(key)=>{
    const command = new DeleteObjectCommand({
        Bucket:wasabiConfig.bucket,
        Key: key,
    });
    return s3Client.send(command);
}

fileExists:async(key)=>{
    try{
        const command = new GetObjectCommand({
            Bucket:wasabiConfig.bucket,
            Key: key,
        });
        await s3Client.send(command);
        return true;
    }
    catch(error){
        if(error.name === "NoSuchKey"){
            return false;
        }
        throw error;
    }
}

                                                                        