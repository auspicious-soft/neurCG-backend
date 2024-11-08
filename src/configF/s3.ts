import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import axios from 'axios';
import { configDotenv } from 'dotenv';
import fs from 'fs';
configDotenv()

const { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME } = process.env;

export const createS3Client = () => {
    return new S3Client({
        region: AWS_REGION,
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID as string,
            secretAccessKey: AWS_SECRET_ACCESS_KEY as string
        },
    });
}

export const generateSignedUrlToUploadOn = async (fileName: string, fileType: string, userEmail: string) => {
    const uploadParams = {
        Bucket: AWS_BUCKET_NAME,
        Key: `projects/${userEmail}/my-projects/${fileName}`,
        ContentType: fileType,
    }
    try {
        const command = new PutObjectCommand(uploadParams);
        const signedUrl = await getSignedUrl(createS3Client(), command);
        return signedUrl;
    } catch (error) {
        console.error("Error generating signed URL:", error);
        throw error;
    }
}
