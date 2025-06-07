// controllers/notesController.js
import Note from '../models/notesModel.js';
import wasabiStorage from '../services/storageServices/index.js';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';

const storage = multer.memoryStorage();

const pdfFileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only PDF files are allowed'), false);
  }
  
  cb(null, true);
};

const pdfUpload = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size for PDFs
  }
}).single('pdf');

// Generate unique key for PDF files
const generatePdfKey = (originalFilename) => {
  const fileExtension = path.extname(originalFilename);
  const randomString = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  return `notes/${timestamp}-${randomString}${fileExtension}`;
};

// Upload PDF to Wasabi
const uploadToWasabi = async (fileBuffer, key, contentType) => {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const wasabiConfig = (await import('../config/wasabiConfig.js')).default;
  
  const s3Client = new S3Client({
    region: wasabiConfig.region,
    endpoint: wasabiConfig.endpoint,
    credentials: wasabiConfig.credentials,
  });

  const command = new PutObjectCommand({
    Bucket: wasabiConfig.bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read' // Make file publicly readable
  });

  console.log('Uploading to Wasabi:', { bucket: wasabiConfig.bucket, key, contentType });
  
  const result = await s3Client.send(command);
  console.log('Upload result:', result);
  
  // Return the key instead of full URL - we'll generate signed URLs for access
  return key;
};

// Controller functions
const notesController = {
  // Add a new note
  addNote: async (req, res) => {
    try {
      // Handle file upload
      pdfUpload(req, res, async (err) => {
        if (err) {
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: 'PDF file is required'
          });
        }

        const { name, description } = req.body;

        // Validate required fields
        if (!name || !description) {
          return res.status(400).json({
            success: false,
            message: 'Name and description are required'
          });
        }

        try {
          // Validate file type from buffer
          const fileInfo = await fileTypeFromBuffer(req.file.buffer);
          
          if (!fileInfo || fileInfo.mime !== 'application/pdf') {
            return res.status(400).json({
              success: false,
              message: 'Invalid PDF file'
            });
          }

          // Generate unique key for the PDF
          const pdfKey = generatePdfKey(req.file.originalname);

          // Upload to Wasabi
          const uploadedKey = await uploadToWasabi(
            req.file.buffer,
            pdfKey,
            req.file.mimetype
          );

          // Save note to database with the key (not full URL)
          const newNote = new Note({
            name: name.trim(),
            description: description.trim(),
            pdfUrl: pdfKey // Store the key, not the full URL
          });

          await newNote.save();

          res.status(201).json({
            success: true,
            message: 'Note uploaded successfully',
            data: {
              id: newNote._id,
              name: newNote.name,
              description: newNote.description,
              pdfKey: newNote.pdfUrl, // This is actually the key now
              createdAt: newNote.createdAt
            }
          });

        } catch (uploadError) {
          console.error('Error uploading note:', uploadError);
          res.status(500).json({
            success: false,
            message: 'Error uploading note to cloud storage',
            error: uploadError.message
          });
        }
      });

    } catch (error) {
      console.error('Error in addNote:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  },

  // Get all notes
  getAllNotes: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const notes = await Note.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Note.countDocuments();

      res.status(200).json({
        success: true,
        data: notes,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: notes.length,
          totalNotes: total
        }
      });

    } catch (error) {
      console.error('Error fetching notes:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching notes',
        error: error.message
      });
    }
  },

  // Get single note by ID
  getNoteById: async (req, res) => {
    try {
      const { id } = req.params;

      const note = await Note.findById(id);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      res.status(200).json({
        success: true,
        data: note
      });

    } catch (error) {
      console.error('Error fetching note:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching note',
        error: error.message
      });
    }
  },

  // Download note (get streaming URL)
  downloadNote: async (req, res) => {
    try {
      const { id } = req.params;

      const note = await Note.findById(id);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // The pdfUrl field now contains the key
      const key = note.pdfUrl;
      
      console.log('Generating download URL for key:', key);

      // Check if file exists first
      const fileExists = await wasabiStorage.fileExists(key);
      if (!fileExists) {
        return res.status(404).json({
          success: false,
          message: 'PDF file not found in storage'
        });
      }

      // Generate streaming URL
      const streamingUrl = await wasabiStorage.getStreamingUrl(key, 3600); // 1 hour expiry
      
      console.log('Generated streaming URL:', streamingUrl);

      res.status(200).json({
        success: true,
        message: 'Download URL generated successfully',
        data: {
          id: note._id,
          name: note.name,
          downloadUrl: streamingUrl,
          expiresIn: 3600 // seconds
        }
      });

    } catch (error) {
      console.error('Error generating download URL:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating download URL',
        error: error.message
      });
    }
  },

  // Direct download/stream PDF
  streamNote: async (req, res) => {
    try {
      const { id } = req.params;

      const note = await Note.findById(id);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // Extract the key from the URL
      const url = new URL(note.pdfUrl);
      const key = url.pathname.substring(url.pathname.indexOf('/') + 1);

      // Generate streaming URL
      const streamingUrl = await wasabiStorage.getStreamingUrl(key, 3600);

      // Redirect to the PDF URL for direct download/viewing
      res.redirect(streamingUrl);

    } catch (error) {
      console.error('Error streaming note:', error);
      res.status(500).json({
        success: false,
        message: 'Error streaming note',
        error: error.message
      });
    }
  },

  // Delete note
deleteNote: async (req, res) => {
    try {
      const { id } = req.params;

      const note = await Note.findById(id);

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }

      // The pdfUrl field contains the key
      const key = note.pdfUrl;

      try {
        // Delete from Wasabi storage
        await wasabiStorage.deleteFile(key);
        console.log('File deleted from storage:', key);
      } catch (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      await Note.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Note deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting note:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting note',
        error: error.message
      });
    }
  }
};

export default notesController;