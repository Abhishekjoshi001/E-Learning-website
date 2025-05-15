import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import path from 'path';
import crypto from 'crypto';
import wasabiConfig from '../../config/wasabiConfig.js';

// Initialize S3 client with Wasabi configuration
const s3Client = new S3Client({
  region: wasabiConfig.region,
  endpoint: wasabiConfig.endpoint,
  credentials: wasabiConfig.credentials,
});

const wasabiStorage = {
  /**
   * Generate a unique key for the file
   * @param {string} originalFilename - Original filename
   * @returns {string} Unique S3 key
   */
  generateKey: (originalFilename) => {
    const fileExtension = path.extname(originalFilename);
    const randomString = crypto.randomBytes(8).toString('hex');
    const timestamp = Date.now();
    return `videos/${timestamp}-${randomString}${fileExtension}`;
  },

  /**
   * Generate a pre-signed URL for direct upload
   * @param {string} key - S3 object key
   * @param {string} contentType - File MIME type
   * @param {number} expiresIn - URL expiration in seconds
   * @returns {Promise<string>} Pre-signed URL
   */
  getUploadUrl: async (key, contentType, expiresIn = 3600) => {
    const command = new PutObjectCommand({
      Bucket: wasabiConfig.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  },

  /**
   * Generate a URL for streaming video
   * @param {string} key - S3 object key
   * @param {number} expiresIn - URL expiration in seconds (default 12 hours)
   * @returns {Promise<string>} Pre-signed URL
   */
  getStreamingUrl: async (key, expiresIn = 43200) => {
    const command = new GetObjectCommand({
      Bucket: wasabiConfig.bucket,
      Key: key,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  },

  /**
   * Delete a file from storage
   * @param {string} key - S3 object key
   * @returns {Promise} Delete operation result
   */
  deleteFile: async (key) => {
    const command = new DeleteObjectCommand({
      Bucket: wasabiConfig.bucket,
      Key: key,
    });

    return s3Client.send(command);
  },

  /**
   * Check if a file exists
   * @param {string} key - S3 object key
   * @returns {Promise<boolean>} Whether file exists
   */
  fileExists: async (key) => {
    try {
      const command = new GetObjectCommand({
        Bucket: wasabiConfig.bucket,
        Key: key,
      });
      await s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NoSuchKey') {
        return false;
      }
      throw error;
    }
  }
};

export default wasabiStorage;
