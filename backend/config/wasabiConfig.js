import dotenv from 'dotenv';
dotenv.config();

const wasabiConfig = {
    region: process.env.WASABI_REGION || 'us-east-1',
    endpoint: process.env.WASABI_ENDPOINT || 'https://s3.wasabisys.com',
    credentials:{
        accessKeyId: process.env.WASABI_ACCESS_KEY,
        secretAccessKey: process.env.WASABI_SECRET_KEY
    },
    bucket: process.env.WASABI_BUCKET,
    httpOptions:{
        timeout: 300000,
    },
    signatureVersion: 'v4'
};

export default wasabiConfig;