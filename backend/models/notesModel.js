// models/noteModel.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const noteSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  pdfUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Note = model('Note', noteSchema);

export default Note;
